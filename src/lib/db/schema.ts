import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// ============================================
// USERS
// ============================================
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// ============================================
// TODOS
// ============================================
export const todos = pgTable("todos", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Todo = InferSelectModel<typeof todos>;
export type NewTodo = InferInsertModel<typeof todos>;

// ============================================
// PHOTOS (Google Drive Lite)
// ============================================
export const photos = pgTable("photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  storagePath: text("storage_path").notNull(),
  size: text("size"), // File size in bytes as string
  mimeType: text("mime_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Photo = InferSelectModel<typeof photos>;
export type NewPhoto = InferInsertModel<typeof photos>;

// ============================================
// FOOD PHOTOS
// ============================================
export const foodPhotos = pgTable("food_photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  storagePath: text("storage_path").notNull(),
  size: text("size"),
  mimeType: text("mime_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type FoodPhoto = InferSelectModel<typeof foodPhotos>;
export type NewFoodPhoto = InferInsertModel<typeof foodPhotos>;

// ============================================
// FOOD REVIEWS
// ============================================
export const foodReviews = pgTable("food_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  foodPhotoId: uuid("food_photo_id").notNull().references(() => foodPhotos.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  rating: text("rating").notNull(), // 1-5 stars stored as text
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type FoodReview = InferSelectModel<typeof foodReviews>;
export type NewFoodReview = InferInsertModel<typeof foodReviews>;

// ============================================
// POKEMON (Saved Pokemon for reviews)
// ============================================
export const pokemon = pgTable("pokemon", {
  id: uuid("id").primaryKey().defaultRandom(),
  pokemonId: text("pokemon_id").notNull(), // PokeAPI ID (e.g., "25" for Pikachu)
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Pokemon = InferSelectModel<typeof pokemon>;
export type NewPokemon = InferInsertModel<typeof pokemon>;

// ============================================
// POKEMON REVIEWS
// ============================================
export const pokemonReviews = pgTable("pokemon_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  pokemonId: uuid("pokemon_id").notNull().references(() => pokemon.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  rating: text("rating").notNull(), // 1-5 stars stored as text
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PokemonReview = InferSelectModel<typeof pokemonReviews>;
export type NewPokemonReview = InferInsertModel<typeof pokemonReviews>;

// ============================================
// NOTES (Markdown Notes)
// ============================================
export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Note = InferSelectModel<typeof notes>;
export type NewNote = InferInsertModel<typeof notes>;
