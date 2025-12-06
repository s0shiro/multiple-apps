/**
 * @jest-environment node
 */
import {
  createTestUser,
  createTestTodo,
  cleanUpDatabase,
  closeDbConnection,
} from "../../setup/dbHelper";
import { db } from "../../../lib/db";
import { todos } from "../../../lib/db/schema";
import { eq } from "drizzle-orm";

describe("Todos Integration", () => {
  afterAll(async () => {
    await cleanUpDatabase();
    await closeDbConnection();
  }, 15000);

  describe("Create Todo", () => {
    it("should create todo for authenticated user", async () => {
      const testUser = await createTestUser();

      const newTodo = await createTestTodo(testUser.user.id, {
        title: "Test todo",
      });

      expect(newTodo).toHaveProperty("id");
      expect(newTodo.title).toBe("Test todo");
      expect(newTodo.userId).toBe(testUser.user.id);
      expect(newTodo.completed).toBe(false);
    });

    it("should create todo with default completed as false", async () => {
      const testUser = await createTestUser();

      const newTodo = await createTestTodo(testUser.user.id, {
        title: "New task",
      });

      expect(newTodo.completed).toBe(false);
    });
  });

  describe("Read Todos", () => {
    it("should only return todos for the user who created them", async () => {
      const testUser = await createTestUser();

      // Create multiple todos for the same user
      await createTestTodo(testUser.user.id, { title: "First todo" });
      await createTestTodo(testUser.user.id, { title: "Second todo" });

      const userTodos = await db
        .select()
        .from(todos)
        .where(eq(todos.userId, testUser.user.id));

      expect(userTodos).toHaveLength(2);
      expect(userTodos.map(t => t.title)).toContain("First todo");
      expect(userTodos.map(t => t.title)).toContain("Second todo");
    });

    it("should return empty array for user with no todos", async () => {
      const testUser = await createTestUser();

      const userTodos = await db
        .select()
        .from(todos)
        .where(eq(todos.userId, testUser.user.id));

      expect(userTodos).toHaveLength(0);
    });
  });

  describe("Update Todo", () => {
    it("should update todo title", async () => {
      const testUser = await createTestUser();
      const todo = await createTestTodo(testUser.user.id, {
        title: "Original title",
      });

      const [updatedTodo] = await db
        .update(todos)
        .set({ title: "Updated title" })
        .where(eq(todos.id, todo.id))
        .returning();

      expect(updatedTodo.title).toBe("Updated title");
    });

    it("should toggle todo completed status", async () => {
      const testUser = await createTestUser();
      const todo = await createTestTodo(testUser.user.id, {
        title: "Test todo",
        completed: false,
      });

      const [updatedTodo] = await db
        .update(todos)
        .set({ completed: true })
        .where(eq(todos.id, todo.id))
        .returning();

      expect(updatedTodo.completed).toBe(true);
    });
  });

  describe("Delete Todo", () => {
    it("should delete todo by id", async () => {
      const testUser = await createTestUser();
      const todo = await createTestTodo(testUser.user.id, {
        title: "To be deleted",
      });

      await db.delete(todos).where(eq(todos.id, todo.id));

      const remainingTodos = await db
        .select()
        .from(todos)
        .where(eq(todos.id, todo.id));

      expect(remainingTodos).toHaveLength(0);
    });
  });
});
