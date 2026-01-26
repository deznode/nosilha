"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { DirectoryCard } from "@/components/ui/directory-card";
import { PageHeader } from "@/components/ui/page-header";
import {
  getCategoryFromSlug,
  getCategoryDisplayName,
} from "@/lib/directory-utils";
import type { DirectoryEntry } from "@/types/directory";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FilterToolbar,
  ListViewCard,
  type ViewMode,
  type SortBy,
  type DirectoryCategory,
} from "@/components/directory";

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
  /** When true, shows category filter in toolbar (for unified /directory page) */
  showCategoryFilter?: boolean;
}

export function DirectoryCategoryPageContent({
  category,
  entries,
  showCategoryFilter = false,
}: DirectoryCategoryPageContentProps) {
  const router = useRouter();

  // Determine initial category from URL category prop
  // Use getCategoryFromSlug to properly convert URL slugs (e.g., "hotels" → "Hotel")
  const initialCategory: DirectoryCategory =
    category === "all"
      ? "All"
      : ((getCategoryFromSlug(category) ??
          category.charAt(0).toUpperCase() +
            category.slice(1)) as DirectoryCategory);

  const [selectedCategory, setSelectedCategory] =
    useState<DirectoryCategory>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTown, setSelectedTown] = useState("All");
  const [sortBy, setSortBy] = useState<SortBy>("rating");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Track client-side mount to fix Framer Motion SSR hydration issue
  // Without this, animations get stuck at opacity: 0 on initial page load
  // This is a valid SSR hydration pattern - see https://react.dev/learn/you-might-not-need-an-effect
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Valid hydration pattern: intentional re-render needed after SSR
    setHasMounted(true);
  }, []);

  // Page title based on selected category (uses friendly display names like "Hotels", "Heritage Sites")
  const pageTitle =
    selectedCategory === "All"
      ? "Directory"
      : getCategoryDisplayName(selectedCategory);

  // Extract unique towns for filter
  const towns = useMemo(() => {
    const uniqueTowns = Array.from(new Set(entries.map((e) => e.town)));
    return ["All", ...uniqueTowns.sort()];
  }, [entries]);

  const handleMapClick = () => {
    router.push("/map");
  };

  const filteredEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        const matchesSearch =
          entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.town.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTown =
          selectedTown === "All" || entry.town === selectedTown;
        // Category filter: match entry.category against selectedCategory
        const matchesCategory =
          selectedCategory === "All" ||
          entry.category.toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesTown && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "rating") {
          return (b.rating ?? 0) - (a.rating ?? 0);
        }
        return a.name.localeCompare(b.name);
      });
  }, [entries, searchQuery, selectedTown, sortBy, selectedCategory]);

  // Dynamic subtitle based on context
  const subtitle =
    selectedCategory === "All"
      ? "Discover restaurants, hotels, beaches, heritage sites, and nature trails on Brava Island."
      : `Browse all ${pageTitle.toLowerCase()} listings on Brava Island.`;

  return (
    <div className="bg-background-secondary min-h-screen font-sans">
      {/* Header */}
      <div className="border-border-primary bg-background-primary border-b shadow-sm">
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <PageHeader title={pageTitle} subtitle={subtitle} />
            <Link
              href="/contribute/directory"
              className="bg-ocean-blue hover:bg-ocean-blue/90 flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all active:scale-95"
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
        onTownChange={setSelectedTown}
        sortBy={sortBy}
        onSortChange={setSortBy}
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
              className="bg-ocean-blue hover:bg-ocean-blue/90 focus:ring-ocean-blue mt-6 inline-block rounded-md px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
            >
              Back to Home
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
