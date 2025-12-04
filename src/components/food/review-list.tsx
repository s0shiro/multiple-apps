"use client";

import type { FoodReview } from "@/lib/db/schema";
import { ReviewItem } from "./review-item";
import { MessageSquare } from "lucide-react";

interface ReviewListProps {
  reviews: FoodReview[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center">
        <MessageSquare className="mb-4 h-10 w-10 text-muted-foreground" />
        <h3 className="mb-1 text-base font-medium">No reviews yet</h3>
        <p className="text-sm text-muted-foreground">
          Be the first to leave a review!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </div>
  );
}
