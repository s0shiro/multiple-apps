"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { z } from "zod";
import { eq, and, ilike, asc, desc } from "drizzle-orm";
import { getAuthenticatedUser } from "./auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensurePhotosBucket, getPhotosBucketName } from "@/lib/supabase/storage";

// Validation schemas
const createPhotoSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
});

const updatePhotoSchema = z.object({
  id: z.uuid("Invalid photo ID"),
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
});

export type CreatePhotoInput = z.infer<typeof createPhotoSchema>;
export type UpdatePhotoInput = z.infer<typeof updatePhotoSchema>;

export type PhotoActionResult =
  | { success: true }
  | { success: false; error: string };

export type SortField = "name" | "createdAt";
export type SortOrder = "asc" | "desc";

// Get all photos for the current user with optional search and sort
export async function getPhotos(options?: {
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
    let query = db.select().from(photos).where(eq(photos.userId, user.id));

    // Add search filter if provided
    if (search && search.trim()) {
      query = db
        .select()
        .from(photos)
        .where(and(eq(photos.userId, user.id), ilike(photos.name, `%${search.trim()}%`)));
    }

    // Apply sorting
    const orderFn = sortOrder === "asc" ? asc : desc;
    const sortColumn = sortBy === "name" ? photos.name : photos.createdAt;

    const userPhotos = await query.orderBy(orderFn(sortColumn));

    return { success: true as const, data: userPhotos };
  } catch {
    return { success: false as const, error: "Failed to fetch photos", data: [] };
  }
}

// Get a single photo by ID
export async function getPhotoById(id: string) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false as const, error: "Not authenticated", data: null };
  }

  try {
    const photo = await db
      .select()
      .from(photos)
      .where(and(eq(photos.id, id), eq(photos.userId, user.id)))
      .limit(1);

    if (photo.length === 0) {
      return { success: false as const, error: "Photo not found", data: null };
    }

    return { success: true as const, data: photo[0] };
  } catch {
    return { success: false as const, error: "Failed to fetch photo", data: null };
  }
}

// Upload and create a new photo
export async function uploadPhoto(formData: FormData): Promise<PhotoActionResult> {
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

  const result = createPhotoSchema.safeParse({ name: name || file.name });

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

    // Generate unique file path
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
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
    await db.insert(photos).values({
      userId: user.id,
      name: result.data.name,
      url: urlData.publicUrl,
      storagePath: fileName,
      size: file.size.toString(),
      mimeType: file.type,
    });

    revalidatePath("/drive");
    return { success: true };
  } catch (error) {
    console.error("Upload photo error:", error);
    return { success: false, error: "Failed to create photo" };
  }
}

// Update a photo name
export async function updatePhoto(
  id: string,
  data: { name: string }
): Promise<PhotoActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const result = updatePhotoSchema.safeParse({ id, ...data });

  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid input";
    return { success: false, error: firstError };
  }

  try {
    // Ensure the photo belongs to the current user
    const existingPhoto = await db
      .select()
      .from(photos)
      .where(and(eq(photos.id, id), eq(photos.userId, user.id)))
      .limit(1);

    if (existingPhoto.length === 0) {
      return { success: false, error: "Photo not found" };
    }

    await db
      .update(photos)
      .set({
        name: data.name,
        updatedAt: new Date(),
      })
      .where(and(eq(photos.id, id), eq(photos.userId, user.id)));

    revalidatePath("/drive");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update photo" };
  }
}

// Delete a photo
export async function deletePhoto(id: string): Promise<PhotoActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Get the photo to find its storage path
    const existingPhoto = await db
      .select()
      .from(photos)
      .where(and(eq(photos.id, id), eq(photos.userId, user.id)))
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

    // Delete from database
    await db
      .delete(photos)
      .where(and(eq(photos.id, id), eq(photos.userId, user.id)));

    revalidatePath("/drive");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete photo" };
  }
}
