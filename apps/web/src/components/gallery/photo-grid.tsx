"use client";

import { Filter, ZoomIn } from "lucide-react";
import Image from "next/image";
import type { MediaItem, MediaCategory } from "@/types/media";

interface PhotoGridProps {
  photos: MediaItem[];
  categoryFilter: MediaCategory | "All";
  onCategoryChange: (category: MediaCategory | "All") => void;
  onPhotoClick: (photo: MediaItem) => void;
}

const CATEGORIES: (MediaCategory | "All")[] = [
  "All",
  "Heritage",
  "Historical",
  "Nature",
  "Event",
  "Culture",
];

function PhotoCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="h-64 bg-slate-200 dark:bg-slate-700" />
      <div className="p-4">
        <div className="mb-2 h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mb-2 h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mb-3 h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
        <div className="border-t border-slate-100 pt-3 dark:border-slate-700">
          <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

export function PhotoGrid({
  photos,
  categoryFilter,
  onCategoryChange,
  onPhotoClick,
}: PhotoGridProps) {
  const filteredPhotos =
    categoryFilter === "All"
      ? photos
      : photos.filter((p) => p.category === categoryFilter);

  return (
    <>
      {/* Filter Bar */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="mr-2 flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
          <Filter size={14} className="mr-1" /> Filter:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              categoryFilter === cat
                ? "border-[var(--color-ocean-blue)] bg-[var(--color-ocean-blue)] text-white"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            className="group relative cursor-zoom-in overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
            onClick={() => onPhotoClick(photo)}
          >
            <div className="relative h-64 overflow-hidden">
              <Image
                src={photo.url}
                alt={photo.title}
                fill
                className="transform object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized // For external URLs
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors group-hover:bg-black/20 group-hover:opacity-100">
                <ZoomIn className="text-white drop-shadow-md" size={32} />
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold tracking-wider text-[var(--color-ocean-blue)] uppercase">
                    {photo.category}
                  </span>
                  <h3 className="mt-1 font-bold text-slate-900 dark:text-white">
                    {photo.title}
                  </h3>
                </div>
                {photo.date && (
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                    {photo.date}
                  </span>
                )}
              </div>
              {photo.description && (
                <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                  {photo.description}
                </p>
              )}
              <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
                Shared by {photo.author || "Anonymous"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white py-20 text-center dark:border-slate-700 dark:bg-slate-800">
          <p className="text-slate-500 dark:text-slate-400">
            No photos found in this category.
          </p>
        </div>
      )}
    </>
  );
}

export function PhotoGridSkeleton() {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <div className="h-5 w-16 rounded bg-slate-200 dark:bg-slate-700" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PhotoCardSkeleton />
        <PhotoCardSkeleton />
        <PhotoCardSkeleton />
        <PhotoCardSkeleton />
        <PhotoCardSkeleton />
        <PhotoCardSkeleton />
      </div>
    </>
  );
}
