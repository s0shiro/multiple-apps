"use client";

import type { Photo } from "@/lib/db/schema";
import { PhotoCard } from "./photo-card";
import { ImageIcon } from "lucide-react";

interface PhotoGridProps {
  photos: Photo[];
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-1 text-lg font-medium">No photos yet</h3>
        <p className="text-sm text-muted-foreground">
          Upload your first photo to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
}
