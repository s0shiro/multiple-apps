import { createClient } from "@supabase/supabase-js";
import { db, closeConnection } from "../../lib/db";
import {
  users,
  todos,
  photos,
  foodPhotos,
  foodReviews,
  pokemon,
  pokemonReviews,
  notes,
  type NewUser,
  type NewTodo,
} from "../../lib/db/schema";
import { eq } from "drizzle-orm";

// Supabase admin client for user management
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Supabase client for auth operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Creates a test user in both Supabase Auth and the database.
 * Returns the user, session token, and password for testing.
 */
export const createTestUser = async (userData: Partial<NewUser> = {}) => {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const defaultData = {
    email: `test-${uniqueId}@example.com`,
    name: `Test User ${uniqueId}`,
    ...userData,
  };
  const password = "testpassword123";

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: defaultData.email,
    password,
    email_confirm: true, // Auto-confirm email
  });

  if (authError) {
    throw new Error(`Failed to create auth user: ${authError.message}`);
  }

  // Create user in database with Supabase Auth ID
  const [dbUser] = await db
    .insert(users)
    .values({
      id: authData.user.id,
      email: defaultData.email,
      name: defaultData.name,
    })
    .returning();

  // Sign in to get session token
  const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
    email: defaultData.email,
    password,
  });

  if (sessionError) {
    throw new Error(`Failed to sign in test user: ${sessionError.message}`);
  }

  return {
    user: dbUser,
    authUser: authData.user,
    session: sessionData.session,
    token: sessionData.session?.access_token,
    password,
  };
};

/**
 * Creates a test todo for a user.
 */
export const createTestTodo = async (userId: string, todoData: Partial<NewTodo> = {}) => {
  const defaultData = {
    title: `Test Todo ${Date.now()}`,
    completed: false,
    ...todoData,
  };

  const [todo] = await db
    .insert(todos)
    .values({
      userId,
      ...defaultData,
    })
    .returning();

  return todo;
};

/**
 * Deletes a specific test user and all their data.
 */
export const deleteTestUser = async (userId: string) => {
  // Delete from database (cascades to related tables)
  await db.delete(users).where(eq(users.id, userId));

  // Delete from Supabase Auth
  await supabaseAdmin.auth.admin.deleteUser(userId);
};

/**
 * Cleans up all test data from the database.
 * Use in afterEach/afterAll hooks.
 */
export const cleanUpDatabase = async () => {
  // Delete in order respecting foreign key constraints
  await db.delete(pokemonReviews);
  await db.delete(pokemon);
  await db.delete(foodReviews);
  await db.delete(foodPhotos);
  await db.delete(photos);
  await db.delete(notes);
  await db.delete(todos);
  
  // Get all test users and delete from Supabase Auth
  const allUsers = await db.select().from(users);
  for (const user of allUsers) {
    await supabaseAdmin.auth.admin.deleteUser(user.id);
  }
  
  await db.delete(users);
};

/**
 * Gets a Supabase client for making authenticated requests.
 */
export const getSupabaseClient = () => supabase;

/**
 * Gets the Supabase admin client for admin operations.
 */
export const getSupabaseAdmin = () => supabaseAdmin;

/**
 * Closes the database connection.
 * Use in afterAll hook to prevent Jest from hanging.
 */
export const closeDbConnection = async () => {
  await closeConnection();
};
