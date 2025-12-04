"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { pokemon, pokemonReviews } from "@/lib/db/schema";
import { z } from "zod";
import { eq, and, ilike, asc, desc } from "drizzle-orm";
import { getAuthenticatedUser } from "./auth";

// ============================================
// VALIDATION SCHEMAS
// ============================================
const savePokemonSchema = z.object({
  pokemonId: z.string().min(1, "Pokemon ID is required"),
  name: z.string().min(1, "Name is required"),
  imageUrl: z.string().url("Invalid image URL"),
});

const createReviewSchema = z.object({
  pokemonId: z.uuid("Invalid Pokemon ID"),
  content: z.string().min(1, "Review content is required").max(1000, "Review is too long"),
  rating: z.string().regex(/^[1-5]$/, "Rating must be between 1 and 5"),
});

const updateReviewSchema = z.object({
  id: z.uuid("Invalid review ID"),
  content: z.string().min(1, "Review content is required").max(1000, "Review is too long"),
  rating: z.string().regex(/^[1-5]$/, "Rating must be between 1 and 5"),
});

export type SavePokemonInput = z.infer<typeof savePokemonSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export type SortField = "name" | "createdAt";
export type SortOrder = "asc" | "desc";

// ============================================
// POKEAPI TYPES
// ============================================
export interface PokeAPIPokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork"?: {
        front_default: string | null;
      };
    };
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
  height: number;
  weight: number;
}

// ============================================
// POKEAPI ACTIONS
// ============================================

// Search Pokemon by name using PokeAPI
export async function searchPokemon(name: string): Promise<{
  success: boolean;
  data: PokeAPIPokemon | null;
  error?: string;
}> {
  if (!name.trim()) {
    return { success: false, data: null, error: "Please enter a Pokemon name" };
  }

  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase().trim()}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, data: null, error: "Pokemon not found" };
      }
      return { success: false, data: null, error: "Failed to search Pokemon" };
    }

    const data: PokeAPIPokemon = await response.json();
    return { success: true, data };
  } catch {
    return { success: false, data: null, error: "Failed to search Pokemon" };
  }
}

// ============================================
// POKEMON ACTIONS
// ============================================

// Get all saved Pokemon for the current user with optional search and sort
export async function getSavedPokemon(options?: {
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
    let query = db.select().from(pokemon).where(eq(pokemon.userId, user.id));

    // Add search filter if provided
    if (search && search.trim()) {
      query = db
        .select()
        .from(pokemon)
        .where(and(eq(pokemon.userId, user.id), ilike(pokemon.name, `%${search.trim()}%`)));
    }

    // Apply sorting
    const orderFn = sortOrder === "asc" ? asc : desc;
    const sortColumn = sortBy === "name" ? pokemon.name : pokemon.createdAt;

    const userPokemon = await query.orderBy(orderFn(sortColumn));

    return { success: true as const, data: userPokemon };
  } catch {
    return { success: false as const, error: "Failed to fetch Pokemon", data: [] };
  }
}

// Get a single saved Pokemon by ID
export async function getSavedPokemonById(id: string) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false as const, error: "Not authenticated", data: null };
  }

  try {
    const savedPokemon = await db
      .select()
      .from(pokemon)
      .where(and(eq(pokemon.id, id), eq(pokemon.userId, user.id)))
      .limit(1);

    if (savedPokemon.length === 0) {
      return { success: false as const, error: "Pokemon not found", data: null };
    }

    return { success: true as const, data: savedPokemon[0] };
  } catch {
    return { success: false as const, error: "Failed to fetch Pokemon", data: null };
  }
}

// Save a Pokemon from PokeAPI
export async function savePokemon(data: SavePokemonInput): Promise<ActionResult & { id?: string }> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const result = savePokemonSchema.safeParse(data);

  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid input";
    return { success: false, error: firstError };
  }

  try {
    // Check if this Pokemon is already saved by this user
    const existingPokemon = await db
      .select()
      .from(pokemon)
      .where(
        and(
          eq(pokemon.pokemonId, result.data.pokemonId),
          eq(pokemon.userId, user.id)
        )
      )
      .limit(1);

    if (existingPokemon.length > 0) {
      // Return the existing Pokemon's ID so user can navigate to it
      return { success: true, id: existingPokemon[0].id };
    }

    // Save new Pokemon
    const [newPokemon] = await db
      .insert(pokemon)
      .values({
        pokemonId: result.data.pokemonId,
        name: result.data.name,
        imageUrl: result.data.imageUrl,
        userId: user.id,
      })
      .returning({ id: pokemon.id });

    revalidatePath("/pokemon");
    return { success: true, id: newPokemon.id };
  } catch (error) {
    console.error("Save Pokemon error:", error);
    return { success: false, error: "Failed to save Pokemon" };
  }
}

// Delete a saved Pokemon (also deletes all associated reviews via cascade)
export async function deletePokemon(id: string): Promise<ActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const existingPokemon = await db
      .select()
      .from(pokemon)
      .where(and(eq(pokemon.id, id), eq(pokemon.userId, user.id)))
      .limit(1);

    if (existingPokemon.length === 0) {
      return { success: false, error: "Pokemon not found" };
    }

    await db
      .delete(pokemon)
      .where(and(eq(pokemon.id, id), eq(pokemon.userId, user.id)));

    revalidatePath("/pokemon");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete Pokemon" };
  }
}

// ============================================
// POKEMON REVIEWS ACTIONS
// ============================================

// Get all reviews for a Pokemon
export async function getPokemonReviews(pokemonDbId: string) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false as const, error: "Not authenticated", data: [] };
  }

  try {
    // First verify the Pokemon belongs to the user
    const savedPokemon = await db
      .select()
      .from(pokemon)
      .where(and(eq(pokemon.id, pokemonDbId), eq(pokemon.userId, user.id)))
      .limit(1);

    if (savedPokemon.length === 0) {
      return { success: false as const, error: "Pokemon not found", data: [] };
    }

    const reviews = await db
      .select()
      .from(pokemonReviews)
      .where(eq(pokemonReviews.pokemonId, pokemonDbId))
      .orderBy(desc(pokemonReviews.createdAt));

    return { success: true as const, data: reviews };
  } catch {
    return { success: false as const, error: "Failed to fetch reviews", data: [] };
  }
}

// Create a new review
export async function createPokemonReview(data: {
  pokemonId: string;
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
    // Verify the Pokemon belongs to the user
    const savedPokemon = await db
      .select()
      .from(pokemon)
      .where(and(eq(pokemon.id, data.pokemonId), eq(pokemon.userId, user.id)))
      .limit(1);

    if (savedPokemon.length === 0) {
      return { success: false, error: "Pokemon not found" };
    }

    await db.insert(pokemonReviews).values({
      pokemonId: result.data.pokemonId,
      userId: user.id,
      content: result.data.content,
      rating: result.data.rating,
    });

    revalidatePath(`/pokemon/${data.pokemonId}`);
    return { success: true };
  } catch (error) {
    console.error("Create review error:", error);
    return { success: false, error: "Failed to create review" };
  }
}

// Update a review
export async function updatePokemonReview(
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
      .from(pokemonReviews)
      .where(and(eq(pokemonReviews.id, id), eq(pokemonReviews.userId, user.id)))
      .limit(1);

    if (existingReview.length === 0) {
      return { success: false, error: "Review not found" };
    }

    await db
      .update(pokemonReviews)
      .set({
        content: data.content,
        rating: data.rating,
        updatedAt: new Date(),
      })
      .where(and(eq(pokemonReviews.id, id), eq(pokemonReviews.userId, user.id)));

    revalidatePath(`/pokemon/${existingReview[0].pokemonId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update review" };
  }
}

// Delete a review
export async function deletePokemonReview(id: string): Promise<ActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Ensure the review belongs to the current user
    const existingReview = await db
      .select()
      .from(pokemonReviews)
      .where(and(eq(pokemonReviews.id, id), eq(pokemonReviews.userId, user.id)))
      .limit(1);

    if (existingReview.length === 0) {
      return { success: false, error: "Review not found" };
    }

    await db
      .delete(pokemonReviews)
      .where(and(eq(pokemonReviews.id, id), eq(pokemonReviews.userId, user.id)));

    revalidatePath(`/pokemon/${existingReview[0].pokemonId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete review" };
  }
}
