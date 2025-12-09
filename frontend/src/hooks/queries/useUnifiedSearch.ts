"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEntriesByCategory } from "@/lib/api";
import type { DirectoryEntry } from "@/types/directory";
import type {
  GroupedSearchResults,
  PagefindUI,
  DirectorySearchResult,
  ArticleSearchResult,
} from "@/types/search";
import { toDirectorySearchResult, toArticleSearchResult } from "@/types/search";

interface UseUnifiedSearchOptions {
  /** Maximum results per category (default: 5) */
  maxResultsPerCategory?: number;
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
}

interface UseUnifiedSearchReturn {
  /** Current search query */
  query: string;
  /** Set the search query */
  setQuery: (query: string) => void;
  /** Grouped search results */
  results: GroupedSearchResults;
  /** Whether search is in progress (including debounce wait) */
  isLoading: boolean;
  /** Whether Pagefind is ready */
  isPagefindReady: boolean;
  /** Whether directory data has been loaded */
  isDirectoryLoaded: boolean;
  /** Load directory entries (call on focus) */
  loadDirectory: () => void;
  /** Clear search results */
  clearResults: () => void;
  /** Whether there are any results */
  hasResults: boolean;
  /** Whether a search has completed for the current query */
  hasSearched: boolean;
}

const EMPTY_RESULTS: GroupedSearchResults = {
  places: [],
  articles: [],
};

/**
 * Custom hook for unified search across directory entries and MDX content.
 *
 * Features:
 * - Lazy loads Pagefind on mount
 * - Lazy loads directory entries on demand (call loadDirectory on focus)
 * - Debounced search to prevent excessive queries
 * - Client-side filtering for directory entries
 * - Pagefind search for MDX content
 */
export function useUnifiedSearch(
  options: UseUnifiedSearchOptions = {}
): UseUnifiedSearchReturn {
  const { maxResultsPerCategory = 5, debounceMs = 300 } = options;

  // Search state
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<GroupedSearchResults>(EMPTY_RESULTS);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Pagefind state
  const [pagefind, setPagefind] = useState<PagefindUI | null>(null);
  const [isPagefindReady, setIsPagefindReady] = useState(false);

  // Directory loading control
  const [shouldLoadDirectory, setShouldLoadDirectory] = useState(false);

  // Refs for cleanup
  const searchAbortRef = useRef<AbortController | null>(null);

  // Load Pagefind on mount (lazy, client-side only)
  useEffect(() => {
    async function loadPagefind() {
      if (typeof window === "undefined") return;

      try {
        // Dynamic import to avoid bundler issues
        const pagefindPath = ["/pagefind", "pagefind.js"].join("/");
        const pf = await import(/* webpackIgnore: true */ pagefindPath);
        await pf.init();
        setPagefind(pf);
        setIsPagefindReady(true);
      } catch (_error) {
        // Pagefind not available - likely in development mode before build
        console.warn(
          "Pagefind not loaded. Run 'pnpm run build' to generate search index."
        );
      }
    }
    loadPagefind();
  }, []);

  // TanStack Query for directory entries (lazy loaded on focus)
  const { data: directoryData, isSuccess: isDirectoryLoaded } = useQuery({
    queryKey: ["directory", "search-index", "all"],
    queryFn: async () => {
      const result = await getEntriesByCategory("all", 0, 100);
      return result.items;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: shouldLoadDirectory, // Only load when requested
  });

  // Load directory entries (call this on input focus)
  const loadDirectory = useCallback(() => {
    if (!shouldLoadDirectory) {
      setShouldLoadDirectory(true);
    }
  }, [shouldLoadDirectory]);

  // Debounce query and reset hasSearched when query changes
  useEffect(() => {
    // Reset hasSearched when query changes
    if (query !== debouncedQuery) {
      setHasSearched(false);
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, debouncedQuery]);

  // Search function
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults(EMPTY_RESULTS);
        return;
      }

      // Cancel previous search
      searchAbortRef.current?.abort();
      searchAbortRef.current = new AbortController();

      setIsSearching(true);
      const normalizedQuery = searchQuery.toLowerCase();

      try {
        // Search directory entries (client-side filter)
        const directoryResults: DirectorySearchResult[] = [];
        if (directoryData && directoryData.length > 0) {
          const filtered = directoryData
            .filter(
              (entry: DirectoryEntry) =>
                entry.name.toLowerCase().includes(normalizedQuery) ||
                entry.town.toLowerCase().includes(normalizedQuery) ||
                entry.description.toLowerCase().includes(normalizedQuery)
            )
            .slice(0, maxResultsPerCategory);

          directoryResults.push(...filtered.map(toDirectorySearchResult));
        }

        // Search Pagefind (MDX content)
        const articleResults: ArticleSearchResult[] = [];
        if (pagefind && isPagefindReady) {
          try {
            const pfSearch = await pagefind.search(searchQuery);
            const pfResults = await Promise.all(
              pfSearch.results
                .slice(0, maxResultsPerCategory)
                .map((r) => r.data())
            );
            articleResults.push(
              ...pfResults.map((result, index) =>
                toArticleSearchResult(result, index)
              )
            );
          } catch (error) {
            // Pagefind search error - continue with directory results
            console.error("Pagefind search error:", error);
          }
        }

        setResults({
          places: directoryResults,
          articles: articleResults,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return; // Silently ignore aborted searches
        }
        console.error("Search error:", error);
        setResults(EMPTY_RESULTS);
      } finally {
        setIsSearching(false);
        setHasSearched(true);
      }
    },
    [directoryData, pagefind, isPagefindReady, maxResultsPerCategory]
  );

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    } else {
      setResults(EMPTY_RESULTS);
    }
  }, [debouncedQuery, performSearch]);

  // Clear results
  const clearResults = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    setResults(EMPTY_RESULTS);
    setHasSearched(false);
  }, []);

  // Check if there are any results
  const hasResults = results.places.length > 0 || results.articles.length > 0;

  // Calculate if we're in a "loading" state (either searching or waiting for debounce)
  const isDebouncing = query.length > 0 && query !== debouncedQuery;
  const isLoadingState = isSearching || isDebouncing;

  return {
    query,
    setQuery,
    results,
    isLoading: isLoadingState,
    isPagefindReady,
    isDirectoryLoaded,
    loadDirectory,
    clearResults,
    hasResults,
    hasSearched,
  };
}
