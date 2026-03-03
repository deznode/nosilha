"use client";

import { Search, Map } from "lucide-react";
import { ViewToggle, type ViewMode } from "./view-toggle";
import { getCategoryDisplayName } from "@/lib/directory-utils";

export type SortBy = "rating" | "name";
export type DirectoryCategory =
  | "All"
  | "Restaurant"
  | "Hotel"
  | "Beach"
  | "Heritage"
  | "Nature";

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

// Category display names are now centralized in directory-utils.ts

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
    <div className="border-border-primary bg-background-primary/95 sticky top-16 z-40 border-b shadow-sm backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Search */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search places..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="border-border-primary bg-background-secondary text-text-primary placeholder-text-tertiary focus:border-ocean-blue focus:ring-ocean-blue rounded-button w-full border py-2 pr-4 pl-10 text-sm focus:ring-2"
            />
            <Search className="text-text-secondary absolute top-2.5 left-3 h-4 w-4" />
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
                aria-label="Filter by category"
                className="border-border-primary bg-background-primary text-text-primary focus:border-ocean-blue focus:ring-ocean-blue rounded-button border px-3 py-2 text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryDisplayName(cat)}
                  </option>
                ))}
              </select>
            )}

            {/* Town Filter */}
            <select
              value={selectedTown}
              onChange={(e) => onTownChange(e.target.value)}
              aria-label="Filter by town"
              className="border-border-primary bg-background-primary text-text-primary focus:border-ocean-blue focus:ring-ocean-blue rounded-button border px-3 py-2 text-sm"
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
              aria-label="Sort results by"
              className="border-border-primary bg-background-primary text-text-primary focus:border-ocean-blue focus:ring-ocean-blue rounded-button border px-3 py-2 text-sm"
            >
              <option value="rating">Top Rated</option>
              <option value="name">A-Z</option>
            </select>

            <div className="bg-border-primary mx-2 hidden h-6 w-px md:block" />

            <ViewToggle
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
            />
          </div>
        </div>

        {/* Results count and map toggle */}
        <div className="border-border-secondary mt-4 flex items-center justify-between border-t pt-3">
          <span className="text-text-secondary text-sm">
            Showing {resultCount} places
          </span>
          {onMapClick && (
            <button
              onClick={onMapClick}
              className="text-ocean-blue flex items-center gap-1 text-sm font-medium hover:underline"
            >
              <Map size={16} /> View on Map
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
