import { ImageFilters } from "@/components/shared";

interface PhotoFiltersProps {
  defaultSearch?: string;
  defaultSortBy?: string;
  defaultSortOrder?: string;
}

export function PhotoFilters({
  defaultSearch = "",
  defaultSortBy = "createdAt",
  defaultSortOrder = "desc",
}: PhotoFiltersProps) {
  return (
    <ImageFilters
      basePath="/drive"
      defaultSearch={defaultSearch}
      defaultSortBy={defaultSortBy}
      defaultSortOrder={defaultSortOrder}
      searchPlaceholder="Search photos..."
    />
  );
}
