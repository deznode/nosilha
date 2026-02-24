"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { DirectoryCard } from "@/components/ui/directory-card";
import { PageHeader } from "@/components/ui/page-header";
import {
  getCategoryFromSlug,
  getCategoryDisplayName,
} from "@/lib/directory-utils";
import type { DirectoryEntry } from "@/types/directory";
import type { PaginationMetadata } from "@/lib/api-contracts";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  FilterToolbar,
  ListViewCard,
  type ViewMode,
  type SortBy,
  type DirectoryCategory,
} from "@/components/directory";
import { useBookmarksPrefetch } from "@/hooks/queries/use-bookmarks";
import { Pagination, fromPaginatedResult } from "@/components/ui/pagination";

// All available categories for filtering
const ALL_CATEGORIES: DirectoryCategory[] = [
  "All",
  "Restaurant",
  "Hotel",
  "Beach",
  "Heritage",
  "Nature",
];

export interface DirectoryCategoryPageContentProps {
  /** Category slug from URL, or 'all' for unified directory page */
  category: string;
  entries: DirectoryEntry[];
  /** Pagination metadata from server response */
  pagination?: PaginationMetadata | null;
  /** Initial filter values from URL searchParams */
  initialFilters?: {
    page?: number;
    q?: string;
    town?: string;
    sort?: string;
  };
  /** When true, shows category filter in toolbar (for unified /directory page) */
  showCategoryFilter?: boolean;
}

export function DirectoryCategoryPageContent({
  category,
  entries,
  pagination = null,
  initialFilters,
  showCategoryFilter = false,
}: DirectoryCategoryPageContentProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Prefetch all user bookmarks to populate cache so bookmark buttons show correct state
  useBookmarksPrefetch();

  // Determine initial category from URL category prop
  // Use getCategoryFromSlug to properly convert URL slugs (e.g., "hotels" → "Hotel")
  function getInitialCategory(): DirectoryCategory {
    if (category === "all") {
      return "All";
    }
    const fromSlug = getCategoryFromSlug(category);
    if (fromSlug) {
      return fromSlug as DirectoryCategory;
    }
    // Fallback: capitalize first letter
    return (category.charAt(0).toUpperCase() +
      category.slice(1)) as DirectoryCategory;
  }

  const initialCategory = getInitialCategory();

  const [selectedCategory, setSelectedCategory] =
    useState<DirectoryCategory>(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialFilters?.q ?? "");
  const [selectedTown, setSelectedTown] = useState(
    initialFilters?.town ?? "All"
  );
  const [sortBy, setSortBy] = useState<SortBy>(
    (initialFilters?.sort as SortBy) || "rating"
  );
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Track client-side mount to fix Framer Motion SSR hydration issue
  // Without this, animations get stuck at opacity: 0 on initial page load
  // This is a valid SSR hydration pattern - see https://react.dev/learn/you-might-not-need-an-effect
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  // Debounce search to avoid rapid URL updates
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build URL with filters and navigate (server-side filtering)
  const navigateWithFilters = useCallback(
    (overrides: {
      page?: number;
      q?: string;
      town?: string;
      sort?: string;
    }) => {
      const params = new URLSearchParams();
      const page = overrides.page ?? 0;
      const q = overrides.q ?? debouncedSearch;
      const town = overrides.town ?? selectedTown;
      const sort = overrides.sort ?? sortBy;

      if (page > 0) params.set("page", page.toString());
      if (q) params.set("q", q);
      if (town && town !== "All") params.set("town", town);
      if (sort && sort !== "rating") params.set("sort", sort);

      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [debouncedSearch, selectedTown, sortBy, pathname, router]
  );

  // Navigate when debounced search changes (reset to page 0)
  useEffect(() => {
    if (!hasMounted) return;
    navigateWithFilters({ page: 0, q: debouncedSearch });
    // Only trigger on debouncedSearch changes after mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleTownChange = (town: string) => {
    setSelectedTown(town);
    navigateWithFilters({ page: 0, town });
  };

  const handleSortChange = (sort: SortBy) => {
    setSortBy(sort);
    navigateWithFilters({ page: 0, sort });
  };

  const handlePageChange = (page: number) => {
    navigateWithFilters({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Page title based on selected category (uses friendly display names like "Hotels", "Heritage Sites")
  const pageTitle =
    selectedCategory === "All"
      ? "Directory"
      : getCategoryDisplayName(selectedCategory);

  // Extract unique towns for filter from current page entries
  // Note: with server-side filtering, this only shows towns from the current page
  const towns = useMemo(() => {
    const uniqueTowns = Array.from(new Set(entries.map((e) => e.town)));
    return ["All", ...uniqueTowns.sort()];
  }, [entries]);

  const handleMapClick = () => {
    router.push("/map");
  };

  // With server-side filtering, we only need client-side category filter (if applicable)
  const filteredEntries = useMemo(() => {
    if (!showCategoryFilter || selectedCategory === "All") {
      return entries;
    }
    return entries.filter(
      (entry) => entry.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [entries, showCategoryFilter, selectedCategory]);

  // Dynamic subtitle based on context
  const subtitle =
    selectedCategory === "All"
      ? "Discover restaurants, hotels, beaches, heritage sites, and nature trails on Brava Island."
      : `Browse all ${pageTitle.toLowerCase()} listings on Brava Island.`;

  const paginationData = fromPaginatedResult(pagination);

  return (
    <div className="bg-background-secondary min-h-screen font-sans">
      {/* Header */}
      <div className="border-border-primary bg-background-primary border-b shadow-sm">
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <PageHeader title={pageTitle} subtitle={subtitle} />
            <Link
              href="/contribute/directory"
              className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-button shadow-subtle flex shrink-0 items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition-all active:scale-95"
            >
              <Plus size={18} />
              Add Location
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <FilterToolbar
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        // Category filter props - only passed when showCategoryFilter is true
        categories={showCategoryFilter ? ALL_CATEGORIES : undefined}
        selectedCategory={showCategoryFilter ? selectedCategory : undefined}
        onCategoryChange={showCategoryFilter ? setSelectedCategory : undefined}
        towns={towns}
        selectedTown={selectedTown}
        onTownChange={handleTownChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        resultCount={filteredEntries.length}
        onMapClick={handleMapClick}
      />

      {/* Results */}
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
        {filteredEntries.length > 0 ? (
          <motion.div
            // Key forces re-mount when filters change to re-trigger stagger animation
            // Also handles SSR hydration by changing from "ssr" to filter-based key
            key={
              hasMounted
                ? `${selectedCategory}-${selectedTown}-${searchQuery}`
                : "ssr"
            }
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                : "flex flex-col gap-4"
            }
          >
            {filteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                {viewMode === "grid" ? (
                  <DirectoryCard entry={entry} />
                ) : (
                  <ListViewCard entry={entry} />
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-16 text-center"
          >
            <div className="bg-background-tertiary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Search className="text-text-secondary h-8 w-8" />
            </div>
            <p className="text-text-secondary text-xl">
              {entries.length === 0
                ? `No listings found in the "${pageTitle}" category.`
                : "No listings match your search."}
            </p>
            <p className="text-text-tertiary mt-2 text-base">
              Please try another category or check back later.
            </p>
            <Link
              href="/"
              className="bg-ocean-blue hover:bg-ocean-blue/90 focus:ring-ocean-blue rounded-button shadow-subtle mt-6 inline-block px-6 py-3 text-sm font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
            >
              Back to Home
            </Link>
          </motion.div>
        )}

        {paginationData && (
          <Pagination
            {...paginationData}
            onPageChange={handlePageChange}
            className="mt-8"
          />
        )}
      </div>
    </div>
  );
}
