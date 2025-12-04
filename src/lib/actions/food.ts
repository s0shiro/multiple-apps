"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { foodPhotos, foodReviews } from "@/lib/db/schema";
import { z } from "zod";
import { eq, and, ilike, asc, desc } from "drizzle-orm";
import { getAuthenticatedUser } from "./auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensurePhotosBucket, getPhotosBucketName } from "@/lib/supabase/storage";

// ============================================
// VALIDATION SCHEMAS
// ============================================
const createFoodPhotoSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
});

const updateFoodPhotoSchema = z.object({
  id: z.uuid("Invalid photo ID"),
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
});

const createReviewSchema = z.object({
  foodPhotoId: z.uuid("Invalid photo ID"),
  content: z.string().min(1, "Review content is required").max(1000, "Review is too long"),
  rating: z.string().regex(/^[1-5]$/, "Rating must be between 1 and 5"),
});

const updateReviewSchema = z.object({
  id: z.uuid("Invalid review ID"),
  content: z.string().min(1, "Review content is required").max(1000, "Review is too long"),
  rating: z.string().regex(/^[1-5]$/, "Rating must be between 1 and 5"),
});

export type CreateFoodPhotoInput = z.infer<typeof createFoodPhotoSchema>;
export type UpdateFoodPhotoInput = z.infer<typeof updateFoodPhotoSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export type SortField = "name" | "createdAt";
export type SortOrder = "asc" | "desc";

// ============================================
// FOOD PHOTOS ACTIONS
// ============================================

// Get all food photos for the current user with optional search and sort
export async function getFoodPhotos(options?: {
  search?: string;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false as const, error: "Not authenticated", data: [] };
  }

  const { search, sortBy = "createdAt", sortOrder = "desc" } = options || {};

  try {
    let query = db.select().from(foodPhotos).where(eq(foodPhotos.userId, user.id));

    // Add search filter if provided
    if (search && search.trim()) {
      query = db
        .select()
        .from(foodPhotos)
        .where(and(eq(foodPhotos.userId, user.id), ilike(foodPhotos.name, `%${search.trim()}%`)));
    }

    // Apply sorting
    const orderFn = sortOrder === "asc" ? asc : desc;
    const sortColumn = sortBy === "name" ? foodPhotos.name : foodPhotos.createdAt;

    const userPhotos = await query.orderBy(orderFn(sortColumn));

    return { success: true as const, data: userPhotos };
  } catch {
    return { success: false as const, error: "Failed to fetch food photos", data: [] };
  }
}

// Get a single food photo by ID
export async function getFoodPhotoById(id: string) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false as const, error: "Not authenticated", data: null };
  }

  try {
    const photo = await db
      .select()
      .from(foodPhotos)
      .where(and(eq(foodPhotos.id, id), eq(foodPhotos.userId, user.id)))
      .limit(1);

    if (photo.length === 0) {
      return { success: false as const, error: "Photo not found", data: null };
    }

    return { success: true as const, data: photo[0] };
  } catch {
    return { success: false as const, error: "Failed to fetch photo", data: null };
  }
}

// Upload and create a new food photo
export async function uploadFoodPhoto(formData: FormData): Promise<ActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const file = formData.get("file") as File | null;
  const name = formData.get("name") as string | null;

  if (!file) {
    return { success: false, error: "No file provided" };
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { success: false, error: "Only image files are allowed" };
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { success: false, error: "File size must be less than 5MB" };
  }

  const result = createFoodPhotoSchema.safeParse({ name: name || file.name });

  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid input";
    return { success: false, error: firstError };
  }

  try {
    // Ensure bucket exists before uploading
    await ensurePhotosBucket();
    
    // Use admin client to bypass RLS for storage operations
    const supabase = createAdminClient();
    const bucketName = getPhotosBucketName();

    // Generate unique file path with food prefix
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/food/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { success: false, error: "Failed to upload file" };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    // Save to database
    await db.insert(foodPhotos).values({
      userId: user.id,
      name: result.data.name,
      url: urlData.publicUrl,
      storagePath: fileName,
      size: file.size.toString(),
      mimeType: file.type,
    });

    revalidatePath("/food");
    return { success: true };
  } catch (error) {
    console.error("Upload food photo error:", error);
    return { success: false, error: "Failed to create food photo" };
  }
}

// Update a food photo name
export async function updateFoodPhoto(
  id: string,
  data: { name: string }
): Promise<ActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const result = updateFoodPhotoSchema.safeParse({ id, ...data });

  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid input";
    return { success: false, error: firstError };
  }

  try {
    // Ensure the photo belongs to the current user
    const existingPhoto = await db
      .select()
      .from(foodPhotos)
      .where(and(eq(foodPhotos.id, id), eq(foodPhotos.userId, user.id)))
      .limit(1);

    if (existingPhoto.length === 0) {
      return { success: false, error: "Photo not found" };
    }

    await db
      .update(foodPhotos)
      .set({
        name: data.name,
        updatedAt: new Date(),
      })
      .where(and(eq(foodPhotos.id, id), eq(foodPhotos.userId, user.id)));

    revalidatePath("/food");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update photo" };
  }
}

// Delete a food photo (also deletes all associated reviews via cascade)
export async function deleteFoodPhoto(id: string): Promise<ActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Get the photo to find its storage path
    const existingPhoto = await db
      .select()
      .from(foodPhotos)
      .where(and(eq(foodPhotos.id, id), eq(foodPhotos.userId, user.id)))
      .limit(1);

    if (existingPhoto.length === 0) {
      return { success: false, error: "Photo not found" };
    }

    // Use admin client to bypass RLS for storage operations
    const supabase = createAdminClient();
    const bucketName = getPhotosBucketName();

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(bucketName)
      .remove([existingPhoto[0].storagePath]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database (reviews are deleted via cascade)
    await db
      .delete(foodPhotos)
      .where(and(eq(foodPhotos.id, id), eq(foodPhotos.userId, user.id)));

    revalidatePath("/food");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete photo" };
  }
}

// ============================================
// FOOD REVIEWS ACTIONS
// ============================================

// Get all reviews for a food photo
export async function getFoodReviews(foodPhotoId: string) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false as const, error: "Not authenticated", data: [] };
  }

  try {
    // First verify the photo belongs to the user
    const photo = await db
      .select()
      .from(foodPhotos)
      .where(and(eq(foodPhotos.id, foodPhotoId), eq(foodPhotos.userId, user.id)))
      .limit(1);

    if (photo.length === 0) {
      return { success: false as const, error: "Photo not found", data: [] };
    }

    const reviews = await db
      .select()
      .from(foodReviews)
      .where(eq(foodReviews.foodPhotoId, foodPhotoId))
      .orderBy(desc(foodReviews.createdAt));

    return { success: true as const, data: reviews };
  } catch {
    return { success: false as const, error: "Failed to fetch reviews", data: [] };
  }
}

// Create a new review
export async function createFoodReview(data: {
  foodPhotoId: string;
  content: string;
  rating: string;
}): Promise<ActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const result = createReviewSchema.safeParse(data);

  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid input";
    return { success: false, error: firstError };
  }

  try {
    // Verify the photo belongs to the user
    const photo = await db
      .select()
      .from(foodPhotos)
      .where(and(eq(foodPhotos.id, data.foodPhotoId), eq(foodPhotos.userId, user.id)))
      .limit(1);

    if (photo.length === 0) {
      return { success: false, error: "Photo not found" };
    }

    await db.insert(foodReviews).values({
      foodPhotoId: result.data.foodPhotoId,
      userId: user.id,
      content: result.data.content,
      rating: result.data.rating,
    });

    revalidatePath(`/food/${data.foodPhotoId}`);
    return { success: true };
  } catch (error) {
    console.error("Create review error:", error);
    return { success: false, error: "Failed to create review" };
  }
}

// Update a review
export async function updateFoodReview(
  id: string,
  data: { content: string; rating: string }
): Promise<ActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const result = updateReviewSchema.safeParse({ id, ...data });

  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid input";
    return { success: false, error: firstError };
  }

  try {
    // Ensure the review belongs to the current user
    const existingReview = await db
      .select()
      .from(foodReviews)
      .where(and(eq(foodReviews.id, id), eq(foodReviews.userId, user.id)))
      .limit(1);

    if (existingReview.length === 0) {
      return { success: false, error: "Review not found" };
    }

    await db
      .update(foodReviews)
      .set({
        content: data.content,
        rating: data.rating,
        updatedAt: new Date(),
      })
      .where(and(eq(foodReviews.id, id), eq(foodReviews.userId, user.id)));

    revalidatePath(`/food/${existingReview[0].foodPhotoId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update review" };
  }
}

// Delete a review
export async function deleteFoodReview(id: string): Promise<ActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Ensure the review belongs to the current user
    const existingReview = await db
      .select()
      .from(foodReviews)
      .where(and(eq(foodReviews.id, id), eq(foodReviews.userId, user.id)))
      .limit(1);

    if (existingReview.length === 0) {
      return { success: false, error: "Review not found" };
    }

    await db
      .delete(foodReviews)
      .where(and(eq(foodReviews.id, id), eq(foodReviews.userId, user.id)));

    revalidatePath(`/food/${existingReview[0].foodPhotoId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete review" };
  }
}
