import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getFoodPhotoById, getFoodReviews } from "@/lib/actions/food";
import { AddReviewForm } from "@/components/food/add-review-form";
import { ReviewList } from "@/components/food/review-list";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FoodPhotoPageProps {
  params: Promise<{
    photoId: string;
  }>;
}

export default async function FoodPhotoPage({ params }: FoodPhotoPageProps) {
  const { photoId } = await params;
  
  const [photoResult, reviewsResult] = await Promise.all([
    getFoodPhotoById(photoId),
    getFoodReviews(photoId),
  ]);

  if (!photoResult.success || !photoResult.data) {
    notFound();
  }

  const photo = photoResult.data;
  const reviews = reviewsResult.data;

  // Calculate average rating
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + parseInt(r.rating), 0) / reviews.length
      : 0;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/food">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Food Photos
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Photo Section */}
        <Card className="overflow-hidden">
          <div className="relative aspect-square">
            <Image
              src={photo.url}
              alt={photo.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
          <CardContent className="p-4">
            <h1 className="text-xl font-bold">{photo.name}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(avgRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span>
                  {avgRating > 0 ? avgRating.toFixed(1) : "No ratings"}
                </span>
              </div>
              <span>•</span>
              <span>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground" suppressHydrationWarning>
              Uploaded {formatDistanceToNow(new Date(photo.createdAt), { addSuffix: true })}
            </p>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add a Review</CardTitle>
              <CardDescription>
                Share your thoughts about this food
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddReviewForm foodPhotoId={photoId} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>
                {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewList reviews={reviews} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
