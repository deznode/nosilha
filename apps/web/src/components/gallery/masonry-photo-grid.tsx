"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Filter, ZoomIn, Camera, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import type { Photo } from "@/components/ui/image-lightbox";
import { CreditDisplay } from "@/components/ui/credit-display";
import { listStagger, listItem } from "@/lib/animation/variants";
import type { MediaItem, MediaCategory } from "@/types/media";

/** Static shimmer gradient used as blur placeholder while images load. */
const SHIMMER_BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZTJlOGYwIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNmMWY1ZjkiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlMmU4ZjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+";

const FALLBACK_CATEGORIES: MediaCategory[] = [
  "Heritage",
  "Historical",
  "Nature",
  "Event",
  "Culture",
];

/** Maps a MediaItem to the Photo shape expected by ImageLightbox. */
function mediaItemToPhoto(item: MediaItem): Photo {
  return {
    id: item.id,
    src: item.url,
    alt: item.altText || item.title,
    location: item.locationName || "Brava Island",
    date: item.date || "",
    description: item.description || "",
    author: item.author,
    creditPlatform: item.creditPlatform,
    creditHandle: item.creditHandle,
    altText: item.altText,
    cameraMake: item.cameraMake,
    cameraModel: item.cameraModel,
    dateTaken: item.dateTaken,
    approximateDate: item.approximateDate,
    locationName: item.locationName,
    photographerCredit: item.photographerCredit,
    archiveSource: item.archiveSource,
  };
}

interface MasonryPhotoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  photos: MediaItem[];
  categoryFilter: MediaCategory | "All";
  onCategoryChange: (category: MediaCategory | "All") => void;
  categories?: string[];
  totalItems?: number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

export const MasonryPhotoGrid = React.forwardRef<
  HTMLDivElement,
  MasonryPhotoGridProps
>(({ photos, categoryFilter, onCategoryChange, categories: apiCategories, totalItems, hasNextPage, isFetchingNextPage, onLoadMore, className, ...props }, ref) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const resolvedCategories: MediaCategory[] =
    apiCategories && apiCategories.length > 0
      ? (apiCategories as MediaCategory[])
      : FALLBACK_CATEGORIES;

  const categoryCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    counts.set("All", photos.length);
    for (const cat of resolvedCategories) {
      counts.set(cat, photos.filter((p) => p.category === cat).length);
    }
    return counts;
  }, [photos, resolvedCategories]);

  const filteredPhotos =
    categoryFilter === "All"
      ? photos
      : photos.filter((p) => p.category === categoryFilter);

  const lightboxPhotos = filteredPhotos.map(mediaItemToPhoto);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div ref={ref} className={className} {...props}>
      {/* Filter Bar */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="text-muted mr-2 flex items-center text-sm font-medium">
          <Filter size={14} className="mr-1" /> Filter:
        </span>
        {(["All", ...resolvedCategories] as (MediaCategory | "All")[]).map((cat) => {
          const count = categoryCounts.get(cat) ?? 0;
          const isEmpty = cat !== "All" && count === 0;
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              aria-pressed={categoryFilter === cat}
              className={clsx(
                "min-h-[44px] rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                categoryFilter === cat
                  ? "border-ocean-blue bg-ocean-blue dark:text-canvas text-white"
                  : "border-hairline bg-canvas text-muted hover:bg-surface",
                isEmpty && "opacity-40"
              )}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Masonry Photo Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={categoryFilter}
          variants={shouldReduceMotion ? undefined : listStagger}
          initial={shouldReduceMotion ? undefined : "hidden"}
          animate={shouldReduceMotion ? undefined : "show"}
          exit={shouldReduceMotion ? undefined : { opacity: 0 }}
          role="list"
          className="columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3"
        >
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              variants={shouldReduceMotion ? undefined : listItem}
              role="listitem"
              className="group break-inside-avoid"
            >
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openLightbox(index);
                  }
                }}
                onClick={() => openLightbox(index)}
                className={clsx(
                  "bg-canvas rounded-card shadow-subtle hover:shadow-lift",
                  "cursor-zoom-in overflow-hidden transition-all",
                  "focus-visible:ring-ocean-blue focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                )}
              >
                {/* Photo with natural aspect ratio */}
                <div className="relative overflow-hidden">
                  <Image
                    src={photo.url}
                    alt={photo.altText || photo.title}
                    width={800}
                    height={600}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    placeholder="blur"
                    blurDataURL={SHIMMER_BLUR_DATA_URL}
                    className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/20 group-hover:opacity-100">
                    <ZoomIn className="text-white drop-shadow-md" size={32} />
                  </div>
                </div>

                {/* Card content */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-ocean-blue text-xs font-bold tracking-wider uppercase">
                        {photo.category}
                      </span>
                      <h3 className="text-body mt-1 font-bold">
                        {photo.title}
                      </h3>
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
                  <div className="border-hairline mt-3 border-t pt-3">
                    <CreditDisplay
                      credit={photo.author || "Anonymous"}
                      creditPlatform={photo.creditPlatform}
                      creditHandle={photo.creditHandle}
                      variant="card"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty state */}
      {filteredPhotos.length === 0 && (
        <div className="border-hairline bg-canvas flex flex-col items-center rounded-lg border py-20 text-center">
          <Camera
            size={48}
            className="text-ocean-blue mb-4 opacity-60"
            aria-hidden="true"
          />
          <h3 className="text-body mb-2 text-lg font-semibold">
            {categoryFilter === "All"
              ? "No photos yet"
              : `No ${categoryFilter} photos yet`}
          </h3>
          <p className="text-muted mb-6 max-w-sm text-sm">
            Help preserve Brava&apos;s visual heritage by sharing your
            photographs with the community.
          </p>
          <a
            href="/contribute/media"
            className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-button inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition-all active:scale-95"
          >
            Be the first to share
          </a>
        </div>
      )}

      {/* Load More */}
      {hasNextPage && onLoadMore && filteredPhotos.length > 0 && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            aria-live="polite"
            className={clsx(
              "rounded-button border-hairline bg-canvas hover:bg-surface min-h-[44px] border px-8 py-3 text-sm font-medium transition-colors",
              isFetchingNextPage && "cursor-wait opacity-70"
            )}
          >
            {isFetchingNextPage ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                Loading more photos...
              </span>
            ) : (
              `Load More Photos (showing ${filteredPhotos.length} of ${totalItems ?? filteredPhotos.length})`
            )}
          </button>
        </div>
      )}

      {/* Lightbox */}
      <ImageLightbox
        photos={lightboxPhotos}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
});
MasonryPhotoGrid.displayName = "MasonryPhotoGrid";

/* ---- Skeleton ---- */

function SkeletonCard({ height }: { height: string }) {
  return (
    <div className="bg-canvas rounded-card shadow-subtle animate-pulse break-inside-avoid overflow-hidden">
      <div className={clsx("bg-surface-alt", height)} />
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

const SKELETON_HEIGHTS = [
  "h-48",
  "h-64",
  "h-56",
  "h-72",
  "h-52",
  "h-60",
  "h-44",
  "h-68",
  "h-58",
];

export function MasonryPhotoGridSkeleton() {
  return (
    <>
      {/* Filter bar skeleton */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <div className="bg-surface-alt h-5 w-16 rounded" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface-alt h-10 w-20 rounded-full" />
        ))}
      </div>
      {/* Masonry skeleton */}
      <div className="columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3">
        {SKELETON_HEIGHTS.map((height, i) => (
          <SkeletonCard key={i} height={height} />
        ))}
      </div>
    </>
  );
}
