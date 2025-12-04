"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { getAuthenticatedUser } from "./auth";

// Validation schemas
const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  content: z.string().default(""),
});

const updateNoteSchema = z.object({
  id: z.string().uuid("Invalid note ID"),
  title: z.string().min(1, "Title is required").max(255, "Title is too long").optional(),
  content: z.string().optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

export type NoteActionResult =
  | { success: true }
  | { success: false; error: string };

// Get all notes for the current user
export async function getNotes() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false as const, error: "Not authenticated", data: [] };
  }

  try {
    const userNotes = await db
      .select()
      .from(notes)
      .where(eq(notes.userId, user.id))
      .orderBy(desc(notes.updatedAt));

    return { success: true as const, data: userNotes };
  } catch {
    return { success: false as const, error: "Failed to fetch notes", data: [] };
  }
}

// Get a single note by ID
export async function getNoteById(id: string) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false as const, error: "Not authenticated", data: null };
  }

  try {
    const note = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, user.id)))
      .limit(1);

    if (note.length === 0) {
      return { success: false as const, error: "Note not found", data: null };
    }

    return { success: true as const, data: note[0] };
  } catch {
    return { success: false as const, error: "Failed to fetch note", data: null };
  }
}

// Create a new note
export async function createNote(formData: FormData): Promise<NoteActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const rawData = {
    title: formData.get("title"),
    content: formData.get("content") || "",
  };

  const result = createNoteSchema.safeParse(rawData);

  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid input";
    return { success: false, error: firstError };
  }

  try {
    await db.insert(notes).values({
      userId: user.id,
      title: result.data.title,
      content: result.data.content,
    });

    revalidatePath("/notes");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to create note" };
  }
}

// Update a note
export async function updateNote(
  id: string,
  data: { title?: string; content?: string }
): Promise<NoteActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const result = updateNoteSchema.safeParse({ id, ...data });

  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid input";
    return { success: false, error: firstError };
  }

  try {
    // Ensure the note belongs to the current user
    const existingNote = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, user.id)))
      .limit(1);

    if (existingNote.length === 0) {
      return { success: false, error: "Note not found" };
    }

    await db
      .update(notes)
      .set({
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
        updatedAt: new Date(),
      })
      .where(and(eq(notes.id, id), eq(notes.userId, user.id)));

    revalidatePath("/notes");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update note" };
  }
}

// Delete a note
export async function deleteNote(id: string): Promise<NoteActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Ensure the note belongs to the current user before deleting
    await db
      .delete(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, user.id)));

    revalidatePath("/notes");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete note" };
  }
}
