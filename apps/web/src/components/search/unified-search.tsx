"use client";

import { useRef, useEffect, useCallback } from "react";
import { Search, ArrowRight, X } from "lucide-react";
import { motion } from "framer-motion";
import { useUnifiedSearch } from "@/hooks/queries/useUnifiedSearch";
import { UnifiedSearchResults } from "./unified-search-results";

interface UnifiedSearchProps {
  /** Placeholder text for input */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Visual variant - 'hero' for atmospheric hero styling */
  variant?: "default" | "hero";
  /** Callback when focus state changes (for parent animations) */
  onFocusChange?: (focused: boolean) => void;
  /** Callback when user submits search (Enter key) */
  onSearchSubmit?: (query: string) => void;
}

export function UnifiedSearch({
  placeholder = "Search places and articles...",
  className = "",
  variant = "default",
  onFocusChange,
  onSearchSubmit,
}: UnifiedSearchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    query,
    setQuery,
    results,
    isLoading,
    loadDirectory,
    clearResults,
    hasResults,
    hasSearched,
  } = useUnifiedSearch();

  // Track whether dropdown should be open
  // Show when: query exists AND (loading OR has results OR search completed)
  const isOpen = query.length > 0 && (isLoading || hasResults || hasSearched);

  // Handle focus
  const handleFocus = useCallback(() => {
    loadDirectory();
    onFocusChange?.(true);
  }, [loadDirectory, onFocusChange]);

  // Handle blur
  const handleBlur = useCallback(() => {
    // Delay to allow click on results
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        onFocusChange?.(false);
      }
    }, 150);
  }, [onFocusChange]);

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (query.trim() && onSearchSubmit) {
        onSearchSubmit(query.trim());
      }
    },
    [query, onSearchSubmit]
  );

  // Handle result selection
  const handleSelect = useCallback(() => {
    clearResults();
    onFocusChange?.(false);
    inputRef.current?.blur();
  }, [clearResults, onFocusChange]);

  // Close on escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        clearResults();
        onFocusChange?.(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearResults, onFocusChange]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onFocusChange?.(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onFocusChange]);

  // Hero variant uses atmospheric dark glass styling
  const isHero = variant === "hero";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center overflow-hidden rounded-xl border transition-colors ${
          isHero
            ? "border-white/20 bg-stone-900/60 shadow-inner backdrop-blur-md focus-within:border-white/40 focus-within:bg-stone-900/80 hover:border-white/30"
            : "border-hairline bg-surface focus-within:border-ocean-blue focus-within:ring-ocean-blue focus-within:ring-1 hover:border-stone-300"
        }`}
      >
        <Search
          size={18}
          className={`ml-5 ${isHero ? "text-stone-400" : "text-muted"}`}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full flex-1 border-none bg-transparent px-3 py-4 text-sm outline-none focus:ring-0 ${
            isHero
              ? "text-stone-200 placeholder-stone-400"
              : "text-body placeholder-muted"
          }`}
          aria-label={placeholder}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="unified-search-results"
          aria-autocomplete="list"
        />

        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              clearResults();
              inputRef.current?.focus();
            }}
            className={`mr-2 p-1 transition-colors ${
              isHero
                ? "text-stone-400 hover:text-white"
                : "text-muted hover:text-body"
            }`}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}

        {/* Submit button */}
        <motion.button
          type="submit"
          whileHover={{ x: 3 }}
          className={`pr-3 transition-colors ${
            isHero
              ? "text-stone-400 hover:text-white"
              : "text-muted hover:text-body"
          }`}
          aria-label="Submit search"
        >
          <ArrowRight size={16} />
        </motion.button>
      </form>

      {/* Results dropdown */}
      {isOpen && (
        <div
          id="unified-search-results"
          role="listbox"
          aria-label="Search results"
          className={`absolute bottom-full z-50 mb-2 w-full rounded-xl border shadow-xl ${
            isHero
              ? "border-white/20 bg-stone-900/95 backdrop-blur-md"
              : "border-hairline bg-surface"
          }`}
        >
          <UnifiedSearchResults
            results={results}
            isLoading={isLoading}
            query={query}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
}
