"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Image as ImageIcon, Play, Plus, Clock } from "lucide-react";
import { clsx } from "clsx";
import {
  MasonryPhotoGrid,
  VideoSection,
} from "@/components/gallery";
import { useGalleryInfiniteQuery } from "@/hooks/queries/useGalleryInfiniteQuery";
import type { MediaItem, MediaCategory } from "@/types/media";

type DecadeFilter = "all" | "pre-1975" | "1975-1990" | "1990-2010" | "2010-plus";

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
  pagination,
}: GalleryContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"photos" | "videos">(initialTab);
  const [categoryFilter, setCategoryFilter] = useState<MediaCategory | "All">(
    initialCategory
  );
  const [decadeFilter, setDecadeFilter] = useState<DecadeFilter>(initialDecade);

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

  const updateUrl = useCallback(
    (
      tab: "photos" | "videos",
      category: MediaCategory | "All",
      decade: DecadeFilter,
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
      const qs = params.toString();
      router.replace(`/gallery${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams]
  );

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

  const contributors = new Set(
    allItems.map((item) => item.author).filter(Boolean)
  );

  return (
    <div className="bg-canvas min-h-screen pb-12">
      {/* Header */}
      <div className="bg-basalt-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-16 sm:px-6 lg:px-8">
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
            />
          </>
        )}

        {/* Video Archive */}
        {activeTab === "videos" && (
          <VideoSection videos={videos} />
        )}
      </div>
    </div>
  );
}
