"use client";

import { MapPin, FileText } from "lucide-react";
import { UnifiedSearchItem } from "./unified-search-item";
import type { GroupedSearchResults } from "@/types/search";

interface UnifiedSearchResultsProps {
  results: GroupedSearchResults;
  isLoading: boolean;
  query: string;
  onSelect?: () => void;
}

export function UnifiedSearchResults({
  results,
  isLoading,
  query,
  onSelect,
}: UnifiedSearchResultsProps) {
  const hasPlaces = results.places.length > 0;
  const hasArticles = results.articles.length > 0;
  const hasResults = hasPlaces || hasArticles;

  if (isLoading) {
    return (
      <div className="px-4 py-6 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-stone-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-500 border-t-amber-200" />
          Searching...
        </div>
      </div>
    );
  }

  if (!hasResults && query) {
    return (
      <div className="px-4 py-6 text-center text-sm text-stone-400">
        No results found for &quot;{query}&quot;
      </div>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto md:max-h-80">
      {/* Places Section */}
      {hasPlaces && (
        <div>
          <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide text-stone-500 uppercase">
            <MapPin size={12} aria-hidden="true" />
            Places
          </div>
          <ul>
            {results.places.map((result) => (
              <UnifiedSearchItem
                key={result.id}
                result={result}
                onSelect={onSelect}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Divider between sections */}
      {hasPlaces && hasArticles && (
        <div className="mx-4 border-t border-white/10" />
      )}

      {/* Articles Section */}
      {hasArticles && (
        <div>
          <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide text-stone-500 uppercase">
            <FileText size={12} aria-hidden="true" />
            Articles
          </div>
          <ul>
            {results.articles.map((result) => (
              <UnifiedSearchItem
                key={result.id}
                result={result}
                onSelect={onSelect}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
