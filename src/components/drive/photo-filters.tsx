"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowUpDown, X } from "lucide-react";
import { useState, useCallback, useTransition } from "react";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(defaultSearch);
  const [isPending, startTransition] = useTransition();

  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      startTransition(() => {
        router.push(`/drive?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateFilters({ search: search.trim() || null });
  }

  function handleClearSearch() {
    setSearch("");
    updateFilters({ search: null });
  }

  function handleSortChange(value: string) {
    const [sortBy, sortOrder] = value.split("-");
    updateFilters({ sortBy, sortOrder });
  }

  const currentSort = `${defaultSortBy}-${defaultSortOrder}`;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9"
          disabled={isPending}
        />
        {search && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </form>

      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <Select value={currentSort} onValueChange={handleSortChange} disabled={isPending}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">Newest first</SelectItem>
            <SelectItem value="createdAt-asc">Oldest first</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
