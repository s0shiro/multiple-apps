import { getFoodPhotos, type SortField, type SortOrder } from "@/lib/actions/food";
import { UploadFoodForm } from "@/components/food/upload-food-form";
import { FoodGrid } from "@/components/food/food-grid";
import { FoodFilters } from "@/components/food/food-filters";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UtensilsCrossed } from "lucide-react";

interface FoodPageProps {
  searchParams: Promise<{
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function FoodPage({ searchParams }: FoodPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const sortBy = (params.sortBy as SortField) || "createdAt";
  const sortOrder = (params.sortOrder as SortOrder) || "desc";

  const { data: photos } = await getFoodPhotos({ search, sortBy, sortOrder });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Food Review</CardTitle>
              <CardDescription>
                {photos.length === 0
                  ? "Upload your first food photo to get started!"
                  : `${photos.length} food photo${photos.length !== 1 ? "s" : ""}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <UploadFoodForm />
          <div className="border-t border-border pt-6">
            <FoodFilters
              defaultSearch={search}
              defaultSortBy={sortBy}
              defaultSortOrder={sortOrder}
            />
          </div>
          <FoodGrid photos={photos} />
        </CardContent>
      </Card>
    </div>
  );
}
