"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Image as ImageIcon, Play, Plus } from "lucide-react";
import { clsx } from "clsx";
import {
  MasonryPhotoGrid,
  VideoSection,
} from "@/components/gallery";
import { useGalleryInfiniteQuery } from "@/hooks/queries/useGalleryInfiniteQuery";
import type { MediaItem, MediaCategory } from "@/types/media";

interface GalleryContentProps {
  photos: MediaItem[];
  videos: MediaItem[];
  categories: string[];
  initialTab: "photos" | "videos";
  initialCategory: MediaCategory | "All";
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
  pagination,
}: GalleryContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"photos" | "videos">(initialTab);
  const [categoryFilter, setCategoryFilter] = useState<MediaCategory | "All">(
    initialCategory
  );

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
  } = useGalleryInfiniteQuery({
    initialData: {
      items: initialItems,
      totalItems: pagination.totalItems,
      totalPages: pagination.totalPages,
      currentPage: pagination.currentPage,
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
    (tab: "photos" | "videos", category: MediaCategory | "All") => {
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
      const qs = params.toString();
      router.replace(`/gallery${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleTabChange = (tab: "photos" | "videos") => {
    setActiveTab(tab);
    updateUrl(tab, categoryFilter);
  };

  const handleCategoryChange = (category: MediaCategory | "All") => {
    setCategoryFilter(category);
    updateUrl(activeTab, category);
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
          <MasonryPhotoGrid
            photos={photos}
            categoryFilter={categoryFilter}
            onCategoryChange={handleCategoryChange}
            categories={categories}
            totalItems={totalItems}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => fetchNextPage()}
          />
        )}

        {/* Video Archive */}
        {activeTab === "videos" && (
          <VideoSection videos={videos} />
        )}
      </div>
    </div>
  );
}
