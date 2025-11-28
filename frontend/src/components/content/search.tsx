"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface SearchResult {
  url: string;
  excerpt: string;
  meta: {
    title?: string;
    category?: string;
  };
}

interface PagefindUI {
  search: (query: string) => Promise<{
    results: Array<{
      id: string;
      data: () => Promise<SearchResult>;
    }>;
  }>;
}

interface ContentSearchProps {
  placeholder?: string;
  className?: string;
  /** Callback when user submits search (Enter key or explicit action) */
  onSearchSubmit?: (query: string) => void;
}

export function ContentSearch({
  placeholder = "Search articles...",
  className = "",
  onSearchSubmit,
}: ContentSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [pagefind, setPagefind] = useState<PagefindUI | null>(null);

  // Load Pagefind on mount (only in browser, after build)
  useEffect(() => {
    async function loadPagefind() {
      if (typeof window === "undefined") return;

      try {
        // Use dynamic path to prevent static analysis by bundler
        const pagefindPath = ["/pagefind", "pagefind.js"].join("/");
        const pf = await import(/* webpackIgnore: true */ pagefindPath);
        await pf.init();
        setPagefind(pf);
      } catch (_error) {
        // Pagefind not available - likely in development mode before build
        console.warn(
          "Pagefind not loaded. Run 'pnpm run build' to generate search index."
        );
      }
    }
    loadPagefind();
  }, []);

  // Search function
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!pagefind || !searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const search = await pagefind.search(searchQuery);
        const searchResults = await Promise.all(
          search.results.slice(0, 10).map((result) => result.data())
        );
        setResults(searchResults);
        setIsOpen(true);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [pagefind]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        performSearch(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Close on escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Search input */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim() && onSearchSubmit) {
              e.preventDefault();
              onSearchSubmit(query.trim());
            }
          }}
          placeholder={placeholder}
          className="focus:border-ocean-blue focus:ring-ocean-blue w-full rounded-lg border border-gray-300 bg-white py-2 pr-10 pl-10 text-sm focus:ring-1 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          aria-label="Search articles"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search results dropdown */}
      {isOpen && (query || results.length > 0) && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <ul className="max-h-96 overflow-y-auto py-2">
              {results.map((result, index) => (
                <li key={index}>
                  <Link
                    href={result.url.replace(/\.html$/, "")}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {result.meta.title || "Untitled"}
                    </div>
                    {result.meta.category && (
                      <span className="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {result.meta.category}
                      </span>
                    )}
                    <p
                      className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400"
                      dangerouslySetInnerHTML={{ __html: result.excerpt }}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : query ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No results found for &quot;{query}&quot;
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
