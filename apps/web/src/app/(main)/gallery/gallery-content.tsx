"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Image as ImageIcon, Play, Plus, Clock, Search, X } from "lucide-react";
import { clsx } from "clsx";
import { MasonryPhotoGrid, VideoSection } from "@/components/gallery";
import { useGalleryInfiniteQuery } from "@/hooks/queries/useGalleryInfiniteQuery";
import type { MediaItem, MediaCategory } from "@/types/media";

type DecadeFilter =
  | "all"
  | "pre-1975"
  | "1975-1990"
  | "1990-2010"
  | "2010-plus";

const ERA_OPTIONS: { value: DecadeFilter; label: string }[] = [
  { value: "all", label: "All Eras" },
  { value: "pre-1975", label: "Pre-1975" },
  { value: "1975-1990", label: "1975\u20131990" },
  { value: "1990-2010", label: "1990\u20132010" },
  { value: "2010-plus", label: "2010+" },
];

interface GalleryContentProps {
  photos: MediaItem[];
  videos: MediaItem[];
  categories: string[];
  initialTab: "photos" | "videos";
  initialCategory: MediaCategory | "All";
  initialDecade: DecadeFilter;
  initialQuery: string;
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
}

export function GalleryContent({
  photos: initialPhotos,
  videos: initialVideos,
  categories,
  initialTab,
  initialCategory,
  initialDecade,
  initialQuery,
  pagination,
}: GalleryContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"photos" | "videos">(initialTab);
  const [categoryFilter, setCategoryFilter] = useState<MediaCategory | "All">(
    initialCategory
  );
  const [decadeFilter, setDecadeFilter] = useState<DecadeFilter>(initialDecade);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input (300ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  const initialItems = useMemo(
    () => [...initialPhotos, ...initialVideos],
    [initialPhotos, initialVideos]
  );

  const {
    items: allItems,
    totalItems,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isLoading,
  } = useGalleryInfiniteQuery({
    initialData: {
      items: initialItems,
      totalItems: pagination.totalItems,
      totalPages: pagination.totalPages,
      currentPage: pagination.currentPage,
    },
    filters: {
      decade: decadeFilter !== "all" ? decadeFilter : undefined,
      q: debouncedQuery || undefined,
    },
  });

  const photos = useMemo(
    () => allItems.filter((item) => item.type === "IMAGE"),
    [allItems]
  );
  const videos = useMemo(
    () => allItems.filter((item) => item.type === "VIDEO"),
    [allItems]
  );

  // Track loaded page count for URL sync
  const loadedPages = useMemo(() => {
    if (!allItems.length) return 0;
    return Math.ceil(allItems.length / 24) - 1;
  }, [allItems.length]);

  const updateUrl = useCallback(
    (
      tab: "photos" | "videos",
      category: MediaCategory | "All",
      decade: DecadeFilter,
      query?: string,
      page?: number
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab !== "photos") {
        params.set("tab", tab);
      } else {
        params.delete("tab");
      }
      if (category !== "All") {
        params.set("category", category);
      } else {
        params.delete("category");
      }
      if (decade !== "all") {
        params.set("decade", decade);
      } else {
        params.delete("decade");
      }
      const q = query !== undefined ? query : debouncedQuery;
      if (q) {
        params.set("q", q);
      } else {
        params.delete("q");
      }
      const p = page !== undefined ? page : loadedPages;
      if (p > 0) {
        params.set("page", String(p));
      } else {
        params.delete("page");
      }
      const qs = params.toString();
      router.replace(`/gallery${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams, debouncedQuery, loadedPages]
  );

  // Sync URL when debounced query or loaded pages change
  useEffect(() => {
    updateUrl(
      activeTab,
      categoryFilter,
      decadeFilter,
      debouncedQuery,
      loadedPages
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, loadedPages]);

  const handleTabChange = (tab: "photos" | "videos") => {
    setActiveTab(tab);
    updateUrl(tab, categoryFilter, decadeFilter);
  };

  const handleCategoryChange = (category: MediaCategory | "All") => {
    setCategoryFilter(category);
    updateUrl(activeTab, category, decadeFilter);
  };

  const handleDecadeChange = (decade: DecadeFilter) => {
    setDecadeFilter(decade);
    updateUrl(activeTab, categoryFilter, decade);
  };

  const clearSearch = () => {
    setSearchInput("");
    setDebouncedQuery("");
  };

  // Compute era counts from loaded photos
  const eraCounts = useMemo(() => {
    const counts = new Map<DecadeFilter, number>();
    counts.set("all", photos.length);
    for (const photo of photos) {
      const year = photo.dateTaken
        ? new Date(photo.dateTaken).getFullYear()
        : photo.approximateDate
          ? parseInt(photo.approximateDate.match(/(\d{4})/)?.[1] ?? "0", 10)
          : null;
      if (year && year > 0) {
        if (year < 1975)
          counts.set("pre-1975", (counts.get("pre-1975") ?? 0) + 1);
        if (year >= 1975 && year <= 1990)
          counts.set("1975-1990", (counts.get("1975-1990") ?? 0) + 1);
        if (year >= 1990 && year <= 2010)
          counts.set("1990-2010", (counts.get("1990-2010") ?? 0) + 1);
        if (year >= 2010)
          counts.set("2010-plus", (counts.get("2010-plus") ?? 0) + 1);
      }
    }
    return counts;
  }, [photos]);

  const contributors = new Set(
    allItems.map((item) => item.author).filter(Boolean)
  );

  return (
    <div className="bg-canvas min-h-screen pb-12">
      {/* Header */}
      <div className="bg-basalt-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="mb-4 font-serif text-3xl font-bold md:text-5xl">
                Brava Media Center
              </h1>
              <p className="max-w-2xl text-lg font-light text-white/70">
                A visual archive of our island. Explore historical photographs,
                community moments, and videos celebrating the culture of Brava.
              </p>
              {totalItems > 0 && (
                <p className="mt-2 text-sm text-white/50">
                  Exploring {totalItems} items
                  {contributors.size > 1
                    ? ` from ${contributors.size} contributors`
                    : ""}{" "}
                  in the Brava visual archive
                </p>
              )}
            </div>
            <Link
              href="/contribute/media"
              className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-button shadow-subtle flex shrink-0 items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition-all active:scale-95"
            >
              <Plus size={18} />
              Add to Archive
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-hairline bg-canvas shadow-subtle sticky top-16 z-30 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => handleTabChange("photos")}
              className={clsx(
                "flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium",
                activeTab === "photos"
                  ? "border-ocean-blue text-ocean-blue"
                  : "text-muted hover:border-hairline hover:text-body border-transparent"
              )}
            >
              <ImageIcon size={18} /> Photo Gallery ({photos.length})
            </button>
            <button
              onClick={() => handleTabChange("videos")}
              className={clsx(
                "flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium",
                activeTab === "videos"
                  ? "border-bougainvillea-pink text-bougainvillea-pink"
                  : "text-muted hover:border-hairline hover:text-body border-transparent"
              )}
            >
              <Play size={18} /> Video & Podcasts ({videos.length})
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search
            size={18}
            className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search photos, videos, locations..."
            className="border-hairline bg-surface text-body placeholder:text-muted focus:border-ocean-blue focus:ring-ocean-blue/20 rounded-button w-full border py-3 pr-10 pl-10 text-sm transition-colors focus:ring-2 focus:outline-none"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="text-muted hover:text-body absolute top-1/2 right-3 -translate-y-1/2"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
        {debouncedQuery && (
          <p className="text-muted -mt-4 mb-4 text-sm" role="status">
            {totalItems === 0
              ? `No results for \u201c${debouncedQuery}\u201d`
              : `${totalItems} result${totalItems !== 1 ? "s" : ""} for \u201c${debouncedQuery}\u201d`}
          </p>
        )}

        {/* Photo Gallery */}
        {activeTab === "photos" && (
          <>
            {/* Era Filter */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-muted mr-2 flex items-center text-sm font-medium">
                <Clock size={14} className="mr-1" /> Era:
              </span>
              {ERA_OPTIONS.map((era) => (
                <button
                  key={era.value}
                  onClick={() => handleDecadeChange(era.value)}
                  aria-pressed={decadeFilter === era.value}
                  className={clsx(
                    "min-h-[44px] rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    decadeFilter === era.value
                      ? "border-valley-green bg-valley-green dark:text-canvas text-white"
                      : "border-hairline bg-canvas text-muted hover:bg-surface"
                  )}
                >
                  {era.label}
                  {era.value !== "all" && eraCounts.has(era.value) && (
                    <span className="ml-1 opacity-70">
                      ({eraCounts.get(era.value)})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <MasonryPhotoGrid
              photos={photos}
              categoryFilter={categoryFilter}
              onCategoryChange={handleCategoryChange}
              categories={categories}
              totalItems={totalItems}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage || isLoading}
              onLoadMore={() => fetchNextPage()}
              searchQuery={debouncedQuery}
            />
          </>
        )}

        {/* Video Archive */}
        {activeTab === "videos" && <VideoSection videos={videos} />}
      </div>
    </div>
  );
}
