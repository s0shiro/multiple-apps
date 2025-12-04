"use client";

import Link from "next/link";
import { deleteFoodPhoto, updateFoodPhoto } from "@/lib/actions/food";
import { ImageCard } from "@/components/shared";
import { MessageSquare } from "lucide-react";
import type { FoodPhoto } from "@/lib/db/schema";
import { ReactNode } from "react";

interface FoodCardProps {
  photo: FoodPhoto;
}

export function FoodCard({ photo }: FoodCardProps) {
  return (
    <ImageCard
      item={photo}
      onDelete={deleteFoodPhoto}
      onUpdate={updateFoodPhoto}
      deleteDialogTitle="Delete Food Photo"
      deleteDialogDescription={`Are you sure you want to delete "${photo.name}"? This will also delete all reviews associated with this photo. This action cannot be undone.`}
      imageOverlay={
        <div className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
          <MessageSquare className="h-4 w-4" />
          <span className="sr-only">View reviews</span>
        </div>
      }
      imageWrapper={(children: ReactNode) => (
        <Link href={`/food/${photo.id}`}>{children}</Link>
      )}
    />
  );
}
