import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { FilterInput, CategoryValue } from "@/schemas/filterSchema";

/**
 * Zustand store for search and filter state management.
 * Manages directory search parameters and syncs with URL params.
 * Does not persist to localStorage (URL is source of truth).
 */

export type SortByValue =
  | "name_asc"
  | "name_desc"
  | "rating_desc"
  | "created_at_desc"
  | "relevance";

interface FilterState {
  // State
  searchQuery: string;
  selectedCategory: CategoryValue | undefined;
  selectedTown: string | undefined;
  minRating: number | undefined;
  hasImage: boolean | undefined;
  sortBy: SortByValue;

  // Actions
  setSearchQuery: (query: string) => void;
  setCategory: (category: CategoryValue | undefined) => void;
  setTown: (town: string | undefined) => void;
  setMinRating: (rating: number | undefined) => void;
  setHasImage: (hasImage: boolean | undefined) => void;
  setSortBy: (sortBy: SortByValue) => void;
  setFilters: (filters: Partial<FilterInput>) => void;
  clearFilters: () => void;

  // Utility
  hasActiveFilters: () => boolean;
}

export const useFilterStore = create<FilterState>()(
  devtools(
    (set, get) => ({
      // Initial state
      searchQuery: "",
      selectedCategory: undefined,
      selectedTown: undefined,
      minRating: undefined,
      hasImage: undefined,
      sortBy: "rating_desc",

      // Actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      setCategory: (category) => set({ selectedCategory: category }),
      setTown: (town) => set({ selectedTown: town }),
      setMinRating: (rating) => set({ minRating: rating }),
      setHasImage: (hasImage) => set({ hasImage }),
      setSortBy: (sortBy) => set({ sortBy }),

      setFilters: (filters) =>
        set((state) => ({
          searchQuery: filters.searchQuery ?? state.searchQuery,
          selectedCategory: filters.category ?? state.selectedCategory,
          selectedTown: filters.town ?? state.selectedTown,
          minRating: filters.minRating ?? state.minRating,
          hasImage: filters.hasImage ?? state.hasImage,
        })),

      clearFilters: () =>
        set({
          searchQuery: "",
          selectedCategory: undefined,
          selectedTown: undefined,
          minRating: undefined,
          hasImage: undefined,
          sortBy: "rating_desc",
        }),

      hasActiveFilters: () => {
        const state = get();
        return !!(
          state.searchQuery ||
          state.selectedCategory ||
          state.selectedTown ||
          state.minRating !== undefined ||
          state.hasImage !== undefined
        );
      },
    }),
    {
      name: "FilterStore",
    }
  )
);

// Selectors for optimized re-renders
export const useSearchQuery = () =>
  useFilterStore((state) => state.searchQuery);
export const useSelectedCategory = () =>
  useFilterStore((state) => state.selectedCategory);
export const useSelectedTown = () =>
  useFilterStore((state) => state.selectedTown);
export const useMinRating = () => useFilterStore((state) => state.minRating);
export const useHasImageFilter = () =>
  useFilterStore((state) => state.hasImage);
export const useSortBy = () => useFilterStore((state) => state.sortBy);
export const useHasActiveFilters = () =>
  useFilterStore((state) => state.hasActiveFilters());
