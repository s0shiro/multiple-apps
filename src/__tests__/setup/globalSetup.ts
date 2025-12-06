import { db } from "../../lib/db";
import {
  users,
  todos,
  photos,
  foodPhotos,
  foodReviews,
  pokemon,
  pokemonReviews,
  notes,
} from "../../lib/db/schema";

/**
 * Global setup that runs once before all tests.
 * Cleans the database to ensure a fresh state.
 */
export default async function globalSetup() {
  console.log("🧹 Cleaning up test database...");

  try {
    // Delete in order respecting foreign key constraints
    await db.delete(pokemonReviews);
    await db.delete(pokemon);
    await db.delete(foodReviews);
    await db.delete(foodPhotos);
    await db.delete(photos);
    await db.delete(notes);
    await db.delete(todos);
    await db.delete(users);

    console.log("✅ Test database cleaned successfully");
  } catch (error) {
    console.error("❌ Failed to clean test database:", error);
    throw error;
  }
}
