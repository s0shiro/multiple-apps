"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { todos } from "@/lib/db/schema";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser } from "./auth";
import { PRIORITY_LEVELS, type Priority } from "@/lib/types/todo";

// Validation schemas
const createTodoSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  priority: z.enum(PRIORITY_LEVELS).default("MEDIUM"),
});

const updateTodoSchema = z.object({
  id: z.uuid("Invalid todo ID"),
  title: z.string().min(1, "Title is required").max(255, "Title is too long").optional(),
  completed: z.boolean().optional(),
  priority: z.enum(PRIORITY_LEVELS).optional(),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;

export type TodoActionResult = 
  | { success: true }
  | { success: false; error: string };

// Get all todos for the current user
export async function getTodos() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false as const, error: "Not authenticated", data: [] };
  }

  try {
    const userTodos = await db
      .select()
      .from(todos)
      .where(eq(todos.userId, user.id))
      .orderBy(todos.createdAt);

    return { success: true as const, data: userTodos };
  } catch {
    return { success: false as const, error: "Failed to fetch todos", data: [] };
  }
}

// Create a new todo
export async function createTodo(formData: FormData): Promise<TodoActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const rawData = {
    title: formData.get("title"),
    priority: formData.get("priority") || "MEDIUM",
  };

  const result = createTodoSchema.safeParse(rawData);

  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid input";
    return { success: false, error: firstError };
  }

  try {
    await db.insert(todos).values({
      userId: user.id,
      title: result.data.title,
      priority: result.data.priority,
      completed: false,
    });

    revalidatePath("/todo");
    return { success: true };
  } catch (error) {
    console.error("Failed to create todo:", error);
    return { success: false, error: "Failed to create todo" };
  }
}

// Update a todo (title, completed status, or priority)
export async function updateTodo(
  id: string,
  data: { title?: string; completed?: boolean; priority?: Priority }
): Promise<TodoActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const result = updateTodoSchema.safeParse({ id, ...data });

  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid input";
    return { success: false, error: firstError };
  }

  try {
    // Ensure the todo belongs to the current user
    const existingTodo = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, user.id)))
      .limit(1);

    if (existingTodo.length === 0) {
      return { success: false, error: "Todo not found" };
    }

    await db
      .update(todos)
      .set({
        ...(data.title !== undefined && { title: data.title }),
        ...(data.completed !== undefined && { completed: data.completed }),
        ...(data.priority !== undefined && { priority: data.priority }),
        updatedAt: new Date(),
      })
      .where(and(eq(todos.id, id), eq(todos.userId, user.id)));

    revalidatePath("/todo");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update todo" };
  }
}

// Toggle todo completion status
export async function toggleTodo(id: string): Promise<TodoActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Get the current todo to toggle its status
    const existingTodo = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, user.id)))
      .limit(1);

    if (existingTodo.length === 0) {
      return { success: false, error: "Todo not found" };
    }

    await db
      .update(todos)
      .set({
        completed: !existingTodo[0].completed,
        updatedAt: new Date(),
      })
      .where(and(eq(todos.id, id), eq(todos.userId, user.id)));

    revalidatePath("/todo");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to toggle todo" };
  }
}

// Delete a todo
export async function deleteTodo(id: string): Promise<TodoActionResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Ensure the todo belongs to the current user before deleting
    const result = await db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, user.id)));

    // Check if any row was deleted (Drizzle doesn't return affected rows directly)
    // We trust the deletion happened if no error was thrown

    revalidatePath("/todo");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete todo" };
  }
}
