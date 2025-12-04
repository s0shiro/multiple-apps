"use client";

import type { Pokemon } from "@/lib/db/schema";
import { Sparkles } from "lucide-react";
import { PokemonCard } from "./pokemon-card";

interface PokemonGridProps {
  pokemon: Pokemon[];
}

export function PokemonGrid({ pokemon }: PokemonGridProps) {
  if (pokemon.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
        <Sparkles className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-medium">No Pokemon saved yet</h3>
        <p className="text-sm text-muted-foreground">
          Search for a Pokemon above to add your first review!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {pokemon.map((p) => (
        <PokemonCard key={p.id} pokemon={p} />
      ))}
    </div>
  );
}
