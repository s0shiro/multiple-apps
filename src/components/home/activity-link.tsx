"use client";

import { CheckSquare, HardDrive, Utensils, Sparkles, StickyNote } from "lucide-react";

const icons = {
  todo: CheckSquare,
  drive: HardDrive,
  food: Utensils,
  pokemon: Sparkles,
  notes: StickyNote,
} as const;

export type ActivityIconName = keyof typeof icons;

interface ActivityLinkProps {
  href: string;
  label: string;
  icon: ActivityIconName;
}

export function ActivityLink({ href, label, icon }: ActivityLinkProps) {
  const Icon = icons[icon];
  
  return (
    <a
      href={href}
      className="flex h-24 w-32 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card p-4 text-center font-medium transition-all duration-200 hover:scale-105 hover:bg-accent hover:text-accent-foreground hover:shadow-lg"
    >
      <Icon className="h-6 w-6" />
      <span className="text-sm">{label}</span>
    </a>
  );
}
