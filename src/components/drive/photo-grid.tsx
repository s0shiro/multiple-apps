"use client";

import type { Photo } from "@/lib/db/schema";
import { PhotoCard } from "./photo-card";
import { ImageGrid } from "@/components/shared";
import { ImageIcon } from "lucide-react";

interface PhotoGridProps {
  photos: Photo[];
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  return (
    <ImageGrid
      items={photos}
      keyExtractor={(photo) => photo.id}
      renderItem={(photo) => <PhotoCard photo={photo} />}
      emptyIcon={ImageIcon}
      emptyTitle="No photos yet"
      emptyDescription="Upload your first photo to get started!"
    />
  );
}
