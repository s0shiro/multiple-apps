"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { searchPokemon, savePokemon, type PokeAPIPokemon } from "@/lib/actions/pokemon";
import { type PokemonSuggestion } from "@/lib/actions/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { AISuggestions } from "./ai-suggestions";

export function PokemonSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<PokeAPIPokemon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  // AI suggestions state - lifted up to persist across view changes
  const [suggestions, setSuggestions] = useState<PokemonSuggestion[]>([]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsSearching(true);

    try {
      const response = await searchPokemon(query);
      if (response.success && response.data) {
        setResult(response.data);
        setShowSuggestions(false);
      } else {
        setError(response.error || "Pokemon not found");
      }
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSuggestionClick(name: string) {
    setQuery(name);
    setError(null);
    setResult(null);
    setIsSearching(true);

    try {
      const response = await searchPokemon(name);
      if (response.success && response.data) {
        setResult(response.data);
        setShowSuggestions(false);
      } else {
        setError(response.error || "Pokemon not found");
      }
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSave() {
    if (!result) return;

    const imageUrl =
      result.sprites.other?.["official-artwork"]?.front_default ||
      result.sprites.front_default ||
      "";

    if (!imageUrl) {
      setError("No image available for this Pokemon");
      return;
    }

    startTransition(async () => {
      const response = await savePokemon({
        pokemonId: result.id.toString(),
        name: result.name,
        imageUrl,
      });

      if (response.success && response.id) {
        router.push(`/pokemon/${response.id}`);
      } else if (!response.success) {
        setError(response.error);
      }
    });
  }

  function handleBackToSuggestions() {
    setResult(null);
    setQuery("");
    setShowSuggestions(true);
  }

  const imageUrl = result
    ? result.sprites.other?.["official-artwork"]?.front_default ||
      result.sprites.front_default
    : null;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search Pokemon by name (e.g., pikachu, charizard)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            disabled={isSearching}
          />
        </div>
        <Button type="submit" disabled={isSearching || !query.trim()}>
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            "Search"
          )}
        </Button>
      </form>

      {/* AI Suggestions */}
      {showSuggestions && !result && (
        <AISuggestions
          suggestions={suggestions}
          onSuggestionsChange={setSuggestions}
          onSuggestionClick={handleSuggestionClick}
          isSearching={isSearching}
        />
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {result && (
        <Card>
          <CardContent className="p-4">
            {/* Back to suggestions button */}
            {suggestions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSuggestions}
                className="mb-3 -ml-2 h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-1 h-3 w-3" />
                Back to suggestions
              </Button>
            )}
            <div className="flex items-center gap-4">
              {imageUrl && (
                <div className="relative h-24 w-24 shrink-0 rounded-lg bg-muted/30">
                  <Image
                    src={imageUrl}
                    alt={result.name}
                    fill
                    sizes="96px"
                    className="object-contain p-2"
                  />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-semibold capitalize">{result.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {result.types.map((t) => (
                    <span
                      key={t.type.name}
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize"
                    >
                      {t.type.name}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Height: {result.height / 10}m • Weight: {result.weight / 10}kg
                </p>
              </div>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add & Review
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
