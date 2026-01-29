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
    <div className="border-hairline bg-canvas animate-pulse overflow-hidden rounded-lg border shadow-sm">
      <div className="bg-surface-alt h-64" />
      <div className="p-4">
        <div className="bg-surface-alt mb-2 h-3 w-16 rounded" />
        <div className="bg-surface-alt mb-2 h-5 w-3/4 rounded" />
        <div className="bg-surface-alt mb-3 h-4 w-full rounded" />
        <div className="border-hairline border-t pt-3">
          <div className="bg-surface-alt h-3 w-24 rounded" />
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
        <span className="text-muted mr-2 flex items-center text-sm font-medium">
          <Filter size={14} className="mr-1" /> Filter:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`min-h-[44px] rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              categoryFilter === cat
                ? "border-ocean-blue bg-ocean-blue text-white"
                : "border-hairline bg-canvas text-muted hover:bg-surface"
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
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPhotoClick(photo);
              }
            }}
            onClick={() => onPhotoClick(photo)}
            className="group border-hairline bg-canvas focus:ring-ocean-blue relative cursor-zoom-in overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:outline-none"
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
                  <span className="text-ocean-blue text-xs font-bold tracking-wider uppercase">
                    {photo.category}
                  </span>
                  <h3 className="text-body mt-1 font-bold">{photo.title}</h3>
                </div>
                {photo.date && (
                  <span className="bg-surface-alt text-muted rounded px-2 py-1 text-xs">
                    {photo.date}
                  </span>
                )}
              </div>
              {photo.description && (
                <p className="text-muted mt-2 line-clamp-2 text-sm">
                  {photo.description}
                </p>
              )}
              <div className="border-hairline text-muted mt-3 border-t pt-3 text-xs">
                Shared by {photo.author || "Anonymous"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="border-hairline bg-canvas rounded-lg border py-20 text-center">
          <p className="text-muted">No photos found in this category.</p>
        </div>
      )}
    </>
  );
}

export function PhotoGridSkeleton() {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <div className="bg-surface-alt h-5 w-16 rounded" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface-alt h-6 w-16 rounded-full" />
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
