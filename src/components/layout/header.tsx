"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  CheckSquare,
  HardDrive,
  UtensilsCrossed,
  Gamepad2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  { href: "/todo", label: "To-Do", icon: CheckSquare },
  { href: "/drive", label: "Drive", icon: HardDrive },
  { href: "/food", label: "Food", icon: UtensilsCrossed },
  { href: "/pokemon", label: "Pokemon", icon: Gamepad2 },
  { href: "/notes", label: "Notes", icon: FileText },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="flex">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold"
          >
            <span className="hidden sm:inline-block">Activities</span>
          </Link>
        </div>

        <nav className="flex flex-1 items-center justify-center gap-1 overflow-x-auto">
          {activities.map((activity) => {
            const Icon = activity.icon;
            const isActive = pathname === activity.href;

            return (
              <Link
                key={activity.href}
                href={activity.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline-block">{activity.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
