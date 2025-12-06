import { render, screen } from "@testing-library/react";
import { Header } from "@/components/layout/header";
import { usePathname } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
}));

// Mock next-themes
jest.mock("next-themes", () => ({
  useTheme: jest.fn(() => ({
    theme: "dark",
    setTheme: jest.fn(),
  })),
}));

// Mock auth actions
jest.mock("@/lib/actions/auth", () => ({
  logout: jest.fn(),
  deleteAccount: jest.fn(),
  getAuthenticatedUser: jest.fn(() => Promise.resolve(null)),
}));

describe("Header", () => {
  it("should renders all activity navigation links", () => {
    render(<Header />);

    expect(screen.getByRole("link", { name: /to-do/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /drive/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /food/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pokemon/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /notes/i })).toBeInTheDocument();
  });

  it("should highlights active link when on /todo", () => {
    (usePathname as jest.Mock).mockReturnValue("/todo");

    render(<Header />);

    const todoLink = screen.getByRole("link", { name: /to-do/i });
    
    // Active link should have bg-accent class
    expect(todoLink).toHaveClass("bg-accent");
  });

  it("should not highlight inactive links", () => {
    (usePathname as jest.Mock).mockReturnValue("/todo");

    render(<Header />);

    const driveLink = screen.getByRole("link", { name: /drive/i });
    
    // Inactive link should have text-muted-foreground class
    expect(driveLink).toHaveClass("text-muted-foreground");
    expect(driveLink).not.toHaveClass("bg-accent");
  })
});
