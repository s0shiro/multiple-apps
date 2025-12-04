"use client";

import { useState } from "react";
import { getPokemonSuggestions, type PokemonSuggestion } from "@/lib/actions/ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";

interface AISuggestionsProps {
  suggestions: PokemonSuggestion[];
  onSuggestionsChange: (suggestions: PokemonSuggestion[]) => void;
  onSuggestionClick: (name: string) => void;
  isSearching: boolean;
}

export function AISuggestions({
  suggestions,
  onSuggestionsChange,
  onSuggestionClick,
  isSearching,
}: AISuggestionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const hasFetched = suggestions.length > 0;

  async function fetchSuggestions() {
    setIsLoading(true);
    try {
      const response = await getPokemonSuggestions();
      if (response.success) {
        onSuggestionsChange(response.suggestions);
      }
    } catch {
      console.error("Failed to fetch suggestions");
    } finally {
      setIsLoading(false);
    }
  }

  // Show the "Get AI suggestions" button if we haven't fetched yet
  if (!hasFetched) {
    return (
      <Button
        variant="outline"
        onClick={fetchSuggestions}
        disabled={isLoading}
        className="w-full border-dashed border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Getting AI suggestions...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Need ideas? Get AI suggestions
          </>
        )}
      </Button>
    );
  }

  // Show the suggestions panel after fetching
  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            <span>AI Suggestions</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSuggestions}
            disabled={isLoading}
            className="h-7 text-xs"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <RefreshCw className="mr-1 h-3 w-3" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {isLoading && suggestions.length === 0 ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Getting suggestions from AI...
            </span>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.name}
                type="button"
                onClick={() => onSuggestionClick(suggestion.name)}
                disabled={isSearching}
                className="group flex flex-col items-start rounded-lg border border-border bg-background p-3 text-left transition-all hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
              >
                <span className="font-medium capitalize text-foreground group-hover:text-primary">
                  {suggestion.name}
                </span>
                <span className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {suggestion.reason}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            No suggestions available. Try refreshing!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
