"use client";

import { useState } from "react";
import { Search, Map, Grid, List, ArrowUpDown, Check } from "lucide-react";
import clsx from "clsx";
import { ViewToggle, type ViewMode } from "./view-toggle";
import { FilterChip } from "@/components/ui/filter-chip";
import { FilterBottomSheet } from "@/components/ui/filter-bottom-sheet";
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
  const [isTownSheetOpen, setIsTownSheetOpen] = useState(false);
  const [pendingTown, setPendingTown] = useState(selectedTown);

  const handleTownSheetOpen = () => {
    setPendingTown(selectedTown);
    setIsTownSheetOpen(true);
  };

  const handleTownApply = () => {
    onTownChange(pendingTown);
    setIsTownSheetOpen(false);
  };

  const handleTownClear = () => {
    setPendingTown("All");
  };

  return (
    <div className="border-border-primary bg-background-primary/95 sticky top-16 z-40 border-b shadow-sm backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 sm:py-4 lg:px-8">
        {/* ── Mobile Layout ── */}
        <div className="flex flex-col gap-2 md:hidden">
          {/* Row 1: Search + result count */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search places..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="border-border-primary bg-background-secondary text-text-primary placeholder-text-tertiary focus:border-ocean-blue focus:ring-ocean-blue rounded-button w-full border py-2 pr-4 pl-9 text-sm focus:ring-2"
              />
              <Search className="text-text-secondary absolute top-2.5 left-3 h-4 w-4" />
            </div>
            <span className="text-muted shrink-0 text-xs font-medium">
              {resultCount}
            </span>
          </div>

          {/* Row 2: Chip bar */}
          <div className="scrollbar-hide -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1">
            {/* Category chips */}
            {showCategoryFilter &&
              categories.map((cat) => (
                <FilterChip
                  key={cat}
                  label={getCategoryDisplayName(cat)}
                  active={selectedCategory === cat}
                  onClick={() => onCategoryChange(cat)}
                />
              ))}

            {/* Town chip → opens bottom sheet */}
            <FilterChip
              label={selectedTown === "All" ? "Town" : selectedTown}
              active={selectedTown !== "All"}
              onClick={handleTownSheetOpen}
              onClear={
                selectedTown !== "All" ? () => onTownChange("All") : undefined
              }
            />

            {/* Sort chip — toggle directly */}
            <FilterChip
              label={sortBy === "rating" ? "Top Rated" : "A-Z"}
              icon={<ArrowUpDown size={14} />}
              onClick={() =>
                onSortChange(sortBy === "rating" ? "name" : "rating")
              }
            />

            {/* Map chip */}
            {onMapClick && (
              <FilterChip
                label="Map"
                icon={<Map size={14} />}
                onClick={onMapClick}
              />
            )}

            {/* View toggle chips */}
            <FilterChip
              label=""
              icon={<Grid size={14} />}
              active={viewMode === "grid"}
              onClick={() => onViewModeChange("grid")}
              aria-label="Grid view"
            />
            <FilterChip
              label=""
              icon={<List size={14} />}
              active={viewMode === "list"}
              onClick={() => onViewModeChange("list")}
              aria-label="List view"
            />
          </div>
        </div>

        {/* ── Desktop Layout (unchanged) ── */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-64">
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
            <div className="flex items-center gap-2">
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

              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortBy)}
                aria-label="Sort results by"
                className="border-border-primary bg-background-primary text-text-primary focus:border-ocean-blue focus:ring-ocean-blue rounded-button border px-3 py-2 text-sm"
              >
                <option value="rating">Top Rated</option>
                <option value="name">A-Z</option>
              </select>

              <div className="bg-border-primary mx-2 h-6 w-px" />

              <ViewToggle
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
              />

              {onMapClick && (
                <button
                  onClick={onMapClick}
                  className="text-ocean-blue flex items-center gap-1 text-sm font-medium hover:underline"
                >
                  <Map size={16} /> Map
                </button>
              )}
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 pt-2">
            <span className="text-text-secondary text-sm">
              Showing {resultCount} places
            </span>
          </div>
        </div>
      </div>

      {/* Town Bottom Sheet (mobile) */}
      <FilterBottomSheet
        isOpen={isTownSheetOpen}
        onClose={() => setIsTownSheetOpen(false)}
        title="Select Town"
        onApply={handleTownApply}
        onClear={handleTownClear}
        activeCount={resultCount}
      >
        <div className="flex flex-col">
          {towns.map((town) => (
            <button
              key={town}
              type="button"
              onClick={() => setPendingTown(town)}
              className={clsx(
                "flex items-center justify-between px-2 py-3 text-left text-sm transition-colors",
                pendingTown === town
                  ? "text-ocean-blue font-medium"
                  : "text-body"
              )}
            >
              <span>{town === "All" ? "All Towns" : town}</span>
              {pendingTown === town && (
                <Check size={18} className="text-ocean-blue shrink-0" />
              )}
            </button>
          ))}
        </div>
      </FilterBottomSheet>
    </div>
  );
}
