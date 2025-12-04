"use client";

import Link from "next/link";
import Image from "next/image";
import type { Pokemon } from "@/lib/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface PokemonCardProps {
  pokemon: Pokemon;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  return (
    <Link href={`/pokemon/${pokemon.id}`}>
      <Card className="group overflow-hidden transition-all hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background">
        <div className="relative aspect-square bg-muted/30">
          <Image
            src={pokemon.imageUrl}
            alt={pokemon.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 transition-transform group-hover:scale-105"
          />
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium capitalize truncate">{pokemon.name}</h3>
          <p className="text-xs text-muted-foreground" suppressHydrationWarning>
            Added {formatDistanceToNow(new Date(pokemon.createdAt), { addSuffix: true })}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
