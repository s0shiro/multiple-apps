"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

// Validation schemas
const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  name: z.string().min(1, "Display name is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export type AuthResult<T> = 
  | { success: true }
  | { success: false; error?: string; fieldErrors?: FieldErrors<T> };

export async function login(formData: FormData): Promise<AuthResult<LoginInput>> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = loginSchema.safeParse(rawData);

  if (!result.success) {
    const fieldErrors: FieldErrors<LoginInput> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof LoginInput;
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return { success: false, fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(result.data);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData): Promise<AuthResult<SignupInput>> {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = signupSchema.safeParse(rawData);

  if (!result.success) {
    const fieldErrors: FieldErrors<SignupInput> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof SignupInput;
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return { success: false, fieldErrors };
  }

  const { name, email, password } = result.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Create user record in the database
  if (data.user) {
    await db.insert(users).values({
      id: data.user.id,
      email,
      name,
    });
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function deleteAccount(): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Delete user from our database first
    await db.delete(users).where(eq(users.id, user.id));

    // Delete user from Supabase Auth using admin client
    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    // Sign out the user
    await supabase.auth.signOut();
  } catch (error) {
    return { success: false, error: "Failed to delete account" };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

// Helper to get authenticated user
export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
