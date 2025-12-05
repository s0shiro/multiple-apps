/**
 * @jest-environment node
 */
import { createTestUser, cleanUpDatabase, getSupabaseClient, closeDbConnection } from "../../setup/dbHelper";

describe("Authentication Integration", () => {
  afterEach(async () => {
    await cleanUpDatabase();
  });

  afterAll(async () => {
    await closeDbConnection();
  });

  describe("signInWithPassword", () => {
    it("should return user object with required properties on valid credentials", async () => {
      const testUser = await createTestUser();
      const supabase = getSupabaseClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: testUser.user.email,
        password: testUser.password,
      });

      expect(error).toBeNull();
      expect(data.user).toHaveProperty("id");
      expect(data.user).toHaveProperty("email", testUser.user.email);
      expect(data.user).toHaveProperty("aud", "authenticated");
    });

    it("should return session with access and refresh tokens", async () => {
      const testUser = await createTestUser();
      const supabase = getSupabaseClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: testUser.user.email,
        password: testUser.password,
      });

      expect(error).toBeNull();
      expect(data.session).toHaveProperty("access_token");
      expect(data.session).toHaveProperty("refresh_token");
      expect(data.session).toHaveProperty("token_type", "bearer");
    });

    it("should return error on invalid credentials", async () => {
      const testUser = await createTestUser();
      const supabase = getSupabaseClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: testUser.user.email,
        password: "wrong-password",
      });

      expect(error).not.toBeNull();
      expect(error?.status).toBe(400);
      expect(error?.message).toBe("Invalid login credentials");
      expect(data.user).toBeNull();
      expect(data.session).toBeNull();
    });

    it("should return error for non-existent user", async () => {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: "nonexistent@example.com",
        password: "any-password",
      });

      expect(error).not.toBeNull();
      expect(error?.status).toBe(400);
      expect(data.user).toBeNull();
    });
  });
});
