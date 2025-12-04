"use client";

import { deletePhoto, updatePhoto } from "@/lib/actions/photos";
import { Button } from "@/components/ui/button";
import { ImageCard } from "@/components/shared";
import { Download, ExternalLink } from "lucide-react";
import type { Photo } from "@/lib/db/schema";

interface PhotoCardProps {
  photo: Photo;
}

export function PhotoCard({ photo }: PhotoCardProps) {
  return (
    <ImageCard
      item={photo}
      onDelete={deletePhoto}
      onUpdate={updatePhoto}
      deleteDialogTitle="Delete Photo"
      deleteDialogDescription={`Are you sure you want to delete "${photo.name}"? This action cannot be undone.`}
      imageOverlay={
        <>
          <Button size="icon-sm" variant="secondary" asChild>
            <a href={photo.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">Open in new tab</span>
            </a>
          </Button>
          <Button size="icon-sm" variant="secondary" asChild>
            <a href={photo.url} download={photo.name}>
              <Download className="h-4 w-4" />
              <span className="sr-only">Download</span>
            </a>
          </Button>
        </>
      }
    />
  );
}
