"use client";

import { useState, useTransition } from "react";
import { createFoodReview } from "@/lib/actions/food";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Star, Send } from "lucide-react";

interface AddReviewFormProps {
  foodPhotoId: string;
}

export function AddReviewForm({ foodPhotoId }: AddReviewFormProps) {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!content.trim()) {
      setError("Please enter a review");
      return;
    }

    startTransition(async () => {
      const result = await createFoodReview({
        foodPhotoId,
        content: content.trim(),
        rating: rating.toString(),
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      // Reset form
      setContent("");
      setRating(0);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              disabled={isPending}
              className="rounded p-1 transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Review</Label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts about this food..."
          rows={3}
          disabled={isPending}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isPending}>
        <Send className="mr-2 h-4 w-4" />
        {isPending ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
