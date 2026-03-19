"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Film } from "lucide-react";
import { listStagger, listItem } from "@/lib/animation/variants";
import { CompactVideoCard } from "@/components/gallery/compact-video-card";
import type { MediaItem } from "@/types/media";

/** Mobile-only inline YouTube card — renders a real iframe for 1-tap play. */
function InlineYouTubeCard({ item }: { item: MediaItem }) {
  const iframeSrc = item.url
    ? item.url + (item.url.includes("?") ? "&" : "?") + "rel=0&playsinline=1"
    : "";

  return (
    <div className="rounded-card bg-canvas shadow-subtle overflow-hidden">
      <div className="relative bg-black pb-[56.25%]">
        <iframe
          src={iframeSrc}
          loading="lazy"
          title={item.title || "Video player"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <div className="space-y-1 p-3">
        <div className="flex items-center gap-1.5">
          <Film size={12} className="text-bougainvillea-pink" />
          <span className="text-bougainvillea-pink text-[11px] font-semibold tracking-wider uppercase">
            {item.category || "Video"}
          </span>
        </div>
        <h3 className="text-body line-clamp-2 text-sm leading-snug font-medium">
          {item.title}
        </h3>
        {item.author && (
          <p className="text-muted truncate text-xs">{item.author}</p>
        )}
      </div>
    </div>
  );
}

interface VideoGridProps {
  items: MediaItem[];
  categoryFilter: string | null;
  /** Featured video ID — excluded from desktop grid (shown in hero) but kept in mobile carousel */
  featuredVideoId?: string | null;
  /** ID of the currently promoted/selected video */
  selectedVideoId?: string | null;
  /** Called when a video card is selected (desktop only) */
  onVideoSelect?: (item: MediaItem) => void;
}

export function VideoGrid({
  items,
  categoryFilter,
  featuredVideoId,
  selectedVideoId,
  onVideoSelect,
}: VideoGridProps) {
  const shouldReduceMotion = useReducedMotion();

  // Desktop grid excludes featured video (shown in hero); mobile carousel includes all
  const desktopItems = useMemo(
    () =>
      featuredVideoId ? items.filter((v) => v.id !== featuredVideoId) : items,
    [items, featuredVideoId]
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <span className="text-muted">No videos found</span>
      </div>
    );
  }

  if (shouldReduceMotion) {
    return (
      <>
        {/* Desktop/tablet grid */}
        <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
          {desktopItems.map((item) => (
            <CompactVideoCard
              key={item.id}
              item={item}
              isActive={item.id === selectedVideoId}
              onSelect={onVideoSelect}
            />
          ))}
        </div>
        {/* Mobile carousel — inline YouTube iframes for 1-tap play */}
        <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:hidden">
          {items.map((item) => (
            <div
              key={item.id}
              className="w-[min(18rem,_80vw)] flex-shrink-0 snap-start"
            >
              <InlineYouTubeCard item={item} />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop/tablet grid */}
      <motion.div
        key={categoryFilter ?? "all"}
        variants={listStagger}
        initial="hidden"
        animate="show"
        className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-3"
      >
        {desktopItems.map((item) => (
          <CompactVideoCard
            key={item.id}
            item={item}
            isActive={item.id === selectedVideoId}
            onSelect={onVideoSelect}
          />
        ))}
      </motion.div>

      {/* Mobile carousel — inline YouTube iframes for 1-tap play */}
      <motion.div
        key={`mobile-${categoryFilter ?? "all"}`}
        variants={listStagger}
        initial="hidden"
        animate="show"
        className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:hidden"
      >
        {items.map((item) => (
          <motion.div
            key={item.id}
            variants={listItem}
            className="w-[min(18rem,_80vw)] flex-shrink-0 snap-start"
          >
            <InlineYouTubeCard item={item} />
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
