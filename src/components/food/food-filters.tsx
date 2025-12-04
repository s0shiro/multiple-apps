import { ImageFilters } from "@/components/shared";

interface FoodFiltersProps {
  defaultSearch?: string;
  defaultSortBy?: string;
  defaultSortOrder?: string;
}

export function FoodFilters({
  defaultSearch = "",
  defaultSortBy = "createdAt",
  defaultSortOrder = "desc",
}: FoodFiltersProps) {
  return (
    <ImageFilters
      basePath="/food"
      defaultSearch={defaultSearch}
      defaultSortBy={defaultSortBy}
      defaultSortOrder={defaultSortOrder}
      searchPlaceholder="Search food photos..."
    />
  );
}
