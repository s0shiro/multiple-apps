/**
 * @jest-environment node
 */
import { createTestUser, cleanUpDatabase, closeDbConnection } from "./dbHelper";

describe("Test Setup", () => {
  afterAll(async () => {
    await cleanUpDatabase();
    await closeDbConnection();
  }, 15000);

  it("should connect to the test database and create a user", async () => {
    const { user, token } = await createTestUser();

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.email).toContain("@example.com");
    expect(token).toBeDefined();
  });

  it("should create user with custom data", async () => {
    const { user } = await createTestUser({
      name: "Custom Test User",
    });

    expect(user.name).toBe("Custom Test User");
  });
});
