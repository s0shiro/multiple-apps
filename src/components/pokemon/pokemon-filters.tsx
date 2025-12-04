import { ImageFilters } from "@/components/shared";

interface PokemonFiltersProps {
  defaultSearch?: string;
  defaultSortBy?: string;
  defaultSortOrder?: string;
}

export function PokemonFilters({
  defaultSearch = "",
  defaultSortBy = "createdAt",
  defaultSortOrder = "desc",
}: PokemonFiltersProps) {
  return (
    <ImageFilters
      basePath="/pokemon"
      defaultSearch={defaultSearch}
      defaultSortBy={defaultSortBy}
      defaultSortOrder={defaultSortOrder}
      searchPlaceholder="Search saved Pokemon..."
    />
  );
}
