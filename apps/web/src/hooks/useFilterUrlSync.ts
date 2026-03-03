"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useFilterStore, type SortByValue } from "@/stores/filterStore";
import type { CategoryValue } from "@/schemas/filterSchema";

/**
 * Custom hook that synchronizes the filterStore with URL search parameters.
 * This enables shareable and bookmarkable filter states.
 *
 * Features:
 * - Reads URL params on mount and initializes the store
 * - Updates URL when store changes (debounced to avoid excessive navigation)
 * - Handles browser back/forward navigation
 * - Preserves filter state across page navigation
 *
 * Usage:
 * ```tsx
 * function DirectoryPage() {
 *   const filters = useFilterUrlSync();
 *   // filters contains current searchQuery, selectedCategory, selectedTown, sortBy
 * }
 * ```
 */
export function useFilterUrlSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get store values and actions
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const selectedCategory = useFilterStore((state) => state.selectedCategory);
  const selectedTown = useFilterStore((state) => state.selectedTown);
  const sortBy = useFilterStore((state) => state.sortBy);
  const minRating = useFilterStore((state) => state.minRating);
  const hasImage = useFilterStore((state) => state.hasImage);

  const setSearchQuery = useFilterStore((state) => state.setSearchQuery);
  const setCategory = useFilterStore((state) => state.setCategory);
  const setTown = useFilterStore((state) => state.setTown);
  const setSortBy = useFilterStore((state) => state.setSortBy);
  const setMinRating = useFilterStore((state) => state.setMinRating);
  const setHasImage = useFilterStore((state) => state.setHasImage);

  // Initialize store from URL params on mount
  useEffect(() => {
    if (isInitialMount.current) {
      const query = searchParams.get("q") || "";
      const category = searchParams.get("category") as CategoryValue | null;
      const town = searchParams.get("town") || undefined;
      const sort = (searchParams.get("sort") as SortByValue) || "rating_desc";
      const minRatingParam = searchParams.get("minRating");
      const hasImageParam = searchParams.get("hasImage");

      // Update store with URL values
      if (query) setSearchQuery(query);
      if (category) setCategory(category);
      if (town) setTown(town);
      if (sort) setSortBy(sort);
      if (minRatingParam) setMinRating(Number(minRatingParam));
      if (hasImageParam) setHasImage(hasImageParam === "true");

      isInitialMount.current = false;
    }
  }, [
    searchParams,
    setSearchQuery,
    setCategory,
    setTown,
    setSortBy,
    setMinRating,
    setHasImage,
  ]);

  // Update URL when store changes (debounced)
  const updateUrl = useCallback(() => {
    if (isInitialMount.current) return;

    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Debounce URL updates by 300ms to avoid excessive navigation
    updateTimeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams();

      if (searchQuery) params.set("q", searchQuery);
      if (selectedCategory) params.set("category", selectedCategory);
      if (selectedTown) params.set("town", selectedTown);
      if (sortBy && sortBy !== "rating_desc") params.set("sort", sortBy);
      if (minRating !== undefined) params.set("minRating", String(minRating));
      if (hasImage !== undefined) params.set("hasImage", String(hasImage));

      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;

      // Use replace to avoid cluttering browser history
      router.replace(newUrl, { scroll: false });
    }, 300);
  }, [
    searchQuery,
    selectedCategory,
    selectedTown,
    sortBy,
    minRating,
    hasImage,
    pathname,
    router,
  ]);

  useEffect(() => {
    updateUrl();

    // Cleanup timeout on unmount
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [updateUrl]);

  // Return current filter values for convenience
  return {
    searchQuery,
    selectedCategory,
    selectedTown,
    sortBy,
    minRating,
    hasImage,
  };
}
