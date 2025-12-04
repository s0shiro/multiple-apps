"use client";

import type { FoodPhoto } from "@/lib/db/schema";
import { FoodCard } from "./food-card";
import { ImageGrid } from "@/components/shared";
import { UtensilsCrossed } from "lucide-react";

interface FoodGridProps {
  photos: FoodPhoto[];
}

export function FoodGrid({ photos }: FoodGridProps) {
  return (
    <ImageGrid
      items={photos}
      keyExtractor={(photo) => photo.id}
      renderItem={(photo) => <FoodCard photo={photo} />}
      emptyIcon={UtensilsCrossed}
      emptyTitle="No food photos yet"
      emptyDescription="Upload your first food photo to get started!"
    />
  );
}
