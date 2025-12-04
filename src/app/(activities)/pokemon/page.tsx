import { getSavedPokemon, type SortField, type SortOrder } from "@/lib/actions/pokemon";
import { PokemonSearch } from "@/components/pokemon/pokemon-search";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { PokemonFilters } from "@/components/pokemon/pokemon-filters";
import { PokemonGrid } from "@/components/pokemon/pokemon-grid";

interface PokemonPageProps {
  searchParams: Promise<{
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function PokemonPage({ searchParams }: PokemonPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const sortBy = (params.sortBy as SortField) || "createdAt";
  const sortOrder = (params.sortOrder as SortOrder) || "desc";

  const { data: savedPokemon } = await getSavedPokemon({ search, sortBy, sortOrder });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Pokemon Review</CardTitle>
              <CardDescription>
                {savedPokemon.length === 0
                  ? "Search for Pokemon to add reviews!"
                  : `${savedPokemon.length} Pokemon saved`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <PokemonSearch />
          <div className="border-t border-border pt-6">
            <PokemonFilters
              defaultSearch={search}
              defaultSortBy={sortBy}
              defaultSortOrder={sortOrder}
            />
          </div>
          <PokemonGrid pokemon={savedPokemon} />
        </CardContent>
      </Card>
    </div>
  );
}
