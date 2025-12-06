import { render, screen } from "@testing-library/react";
import { AuthForm } from "@/components/auth/auth-form";

// Mock auth actions
jest.mock("@/lib/actions/auth", () => ({
  login: jest.fn(() => Promise.resolve({ success: true })),
  signup: jest.fn(() => Promise.resolve({ success: true })),
}));

describe("AuthForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Login Form Labels", () => {
    it("should display email input with correct label", () => {
      render(<AuthForm />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it("should display password input with correct label", () => {
      render(<AuthForm />);

      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });
  });

  describe("Password Field Security", () => {
    it("should have password field with type password", () => {
      render(<AuthForm />);

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute("type", "password");
    });
  });

  describe("Form Input Validation", () => {
    it("should have email input with type email for browser validation", () => {
      render(<AuthForm />);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute("type", "email");
    });
  });
});
