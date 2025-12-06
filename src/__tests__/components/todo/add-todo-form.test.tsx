import { render, screen } from "@testing-library/react";
import { AddTodoForm } from "@/components/todo/add-todo-form";

// Mock todo actions
jest.mock("@/lib/actions/todos", () => ({
  createTodo: jest.fn(() => Promise.resolve({ success: true })),
}));

describe("AddTodoForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Form Elements", () => {
    it("should display text input for todo title", () => {
      render(<AddTodoForm />);

      expect(screen.getByPlaceholderText(/add a new todo/i)).toBeInTheDocument();
    });

    it("should have input with type text", () => {
      render(<AddTodoForm />);

      const input = screen.getByPlaceholderText(/add a new todo/i);
      expect(input).toHaveAttribute("type", "text");
    });

    it("should have input with name attribute for form submission", () => {
      render(<AddTodoForm />);

      const input = screen.getByPlaceholderText(/add a new todo/i);
      expect(input).toHaveAttribute("name", "title");
    });

    it("should have submit button", () => {
      render(<AddTodoForm />);

      expect(screen.getByRole("button", { name: /add todo/i })).toBeInTheDocument();
    });
  });
});
