"use client";

import { Search, Map } from "lucide-react";
import { ViewToggle, type ViewMode } from "./view-toggle";

export type SortBy = "rating" | "name";
export type DirectoryCategory =
  | "All"
  | "Restaurant"
  | "Hotel"
  | "Beach"
  | "Landmark";

interface FilterToolbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  // Category filter (optional - only shown on unified directory page)
  categories?: DirectoryCategory[];
  selectedCategory?: DirectoryCategory;
  onCategoryChange?: (category: DirectoryCategory) => void;
  // Town filter
  towns: string[];
  selectedTown: string;
  onTownChange: (town: string) => void;
  // Sort
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  // View
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  // Results
  resultCount: number;
  onMapClick?: () => void;
}

const CATEGORY_LABELS: Record<DirectoryCategory, string> = {
  All: "All Categories",
  Restaurant: "Restaurants",
  Hotel: "Hotels",
  Beach: "Beaches",
  Landmark: "Landmarks",
};

export function FilterToolbar({
  searchTerm,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  towns,
  selectedTown,
  onTownChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  resultCount,
  onMapClick,
}: FilterToolbarProps) {
  const showCategoryFilter = categories && selectedCategory && onCategoryChange;

  return (
    <div className="sticky top-16 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/95">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Search */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search places..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-4 pl-10 text-sm text-slate-900 placeholder-slate-500 focus:border-[var(--color-ocean-blue)] focus:ring-2 focus:ring-[var(--color-ocean-blue)] dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
            />
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
          </div>

          {/* Filters */}
          <div className="flex w-full flex-wrap items-center gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0">
            {/* Category Filter */}
            {showCategoryFilter && (
              <select
                value={selectedCategory}
                onChange={(e) =>
                  onCategoryChange(e.target.value as DirectoryCategory)
                }
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[var(--color-ocean-blue)] focus:ring-[var(--color-ocean-blue)] dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            )}

            {/* Town Filter */}
            <select
              value={selectedTown}
              onChange={(e) => onTownChange(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[var(--color-ocean-blue)] focus:ring-[var(--color-ocean-blue)] dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              {towns.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "All Towns" : t}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortBy)}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[var(--color-ocean-blue)] focus:ring-[var(--color-ocean-blue)] dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              <option value="rating">Top Rated</option>
              <option value="name">A-Z</option>
            </select>

            <div className="mx-2 hidden h-6 w-px bg-slate-200 md:block dark:bg-slate-600" />

            <ViewToggle
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
            />
          </div>
        </div>

        {/* Results count and map toggle */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Showing {resultCount} places
          </span>
          {onMapClick && (
            <button
              onClick={onMapClick}
              className="flex items-center gap-1 text-sm font-medium text-[var(--color-ocean-blue)] hover:underline"
            >
              <Map size={16} /> View on Map
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
