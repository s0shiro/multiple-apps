"use client";

import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface ImageGridProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  keyExtractor: (item: T) => string;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
}

export function ImageGrid<T>({
  items,
  renderItem,
  keyExtractor,
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptyDescription,
}: ImageGridProps<T>) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <EmptyIcon className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-1 text-lg font-medium">{emptyTitle}</h3>
        <p className="text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <div key={keyExtractor(item)}>{renderItem(item)}</div>
      ))}
    </div>
  );
}
