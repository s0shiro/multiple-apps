import { render, screen } from "@testing-library/react";
import { TodoItem } from "@/components/todo/todo-item";
import type { Todo } from "@/lib/db/schema";

// Mock todo actions
jest.mock("@/lib/actions/todos", () => ({
  toggleTodo: jest.fn(() => Promise.resolve({ success: true })),
  deleteTodo: jest.fn(() => Promise.resolve({ success: true })),
  updateTodo: jest.fn(() => Promise.resolve({ success: true })),
}));

const mockTodo: Todo = {
  id: "test-id-1",
  userId: "user-id-1",
  title: "Test todo item",
  completed: false,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("TodoItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should display todo title", () => {
      render(<TodoItem todo={mockTodo} />);

      expect(screen.getByText("Test todo item")).toBeInTheDocument();
    });

    it("should show checkbox unchecked for incomplete todo", () => {
      render(<TodoItem todo={mockTodo} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });

    it("should show checkbox checked for completed todo", () => {
      const completedTodo = { ...mockTodo, completed: true };
      render(<TodoItem todo={completedTodo} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("should apply line-through style for completed todo", () => {
      const completedTodo = { ...mockTodo, completed: true };
      render(<TodoItem todo={completedTodo} />);

      const titleElement = screen.getByText("Test todo item");
      expect(titleElement).toHaveClass("line-through");
    });
  });

  describe("Action Buttons", () => {
    it("should have delete button", () => {
      render(<TodoItem todo={mockTodo} />);

      expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
    });

    it("should have edit button", () => {
      render(<TodoItem todo={mockTodo} />);

      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible checkbox with proper aria-label", () => {
      render(<TodoItem todo={mockTodo} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute(
        "aria-label",
        expect.stringContaining("Test todo item")
      );
    });
  });
});
