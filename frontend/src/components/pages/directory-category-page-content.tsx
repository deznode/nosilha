"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { DirectoryCard } from "@/components/ui/directory-card";
import { PageHeader } from "@/components/ui/page-header";
import { formatCategoryTitle } from "@/lib/directory-utils";
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
  "Landmark",
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
  const initialCategory: DirectoryCategory =
    category === "all"
      ? "All"
      : ((category.charAt(0).toUpperCase() +
          category.slice(1)) as DirectoryCategory);

  const [selectedCategory, setSelectedCategory] =
    useState<DirectoryCategory>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTown, setSelectedTown] = useState("All");
  const [sortBy, setSortBy] = useState<SortBy>("rating");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Page title based on selected category
  const pageTitle =
    selectedCategory === "All"
      ? "Directory"
      : formatCategoryTitle(selectedCategory.toLowerCase());

  // Extract unique towns for filter
  const towns = useMemo(() => {
    const uniqueTowns = Array.from(new Set(entries.map((e) => e.town)));
    return ["All", ...uniqueTowns.sort()];
  }, [entries]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

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
      ? "Discover restaurants, hotels, beaches, and landmarks on Brava Island."
      : `Browse all ${pageTitle.toLowerCase()} listings on Brava Island.`;

  return (
    <div className="bg-background-secondary min-h-screen font-sans">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
          <PageHeader title={pageTitle} subtitle={subtitle} />
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
                  <DirectoryCard
                    entry={entry}
                    isBookmarked={bookmarkedIds.has(entry.id)}
                    onToggleBookmark={toggleBookmark}
                  />
                ) : (
                  <ListViewCard
                    entry={entry}
                    isBookmarked={bookmarkedIds.has(entry.id)}
                    onToggleBookmark={toggleBookmark}
                  />
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
              <Search className="h-8 w-8 text-slate-500 dark:text-slate-400" />
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
