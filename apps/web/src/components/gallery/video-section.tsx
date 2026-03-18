"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Film } from "lucide-react";
import { FilterChip } from "@/components/ui/filter-chip";
import { FeaturedVideoHero } from "@/components/gallery/featured-video-hero";
import { VideoGrid } from "@/components/gallery/video-grid";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import type { MediaItem } from "@/types/media";

function VideoCardSkeleton() {
  return (
    <div className="bg-canvas animate-pulse overflow-hidden rounded-lg shadow-sm">
      <div className="bg-surface-alt aspect-video w-full" />
      <div className="space-y-2 p-3">
        <div className="bg-surface-alt h-3 w-16 rounded" />
        <div className="bg-surface-alt h-4 w-3/4 rounded" />
        <div className="bg-surface-alt h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

interface VideoSectionProps {
  videos: MediaItem[];
  featuredVideo?: MediaItem | null;
  isLoading?: boolean;
  /** ID of the currently promoted video (from URL state) */
  promotedVideoId?: string | null;
  /** Called when a video is promoted or cleared */
  onPromote?: (id: string | null) => void;
}

export function VideoSection({
  videos,
  featuredVideo,
  isLoading,
  promotedVideoId,
  onPromote,
}: VideoSectionProps) {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollTo } = useSmoothScroll();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Resolve hero video: promoted ?? featured
  const resolvedHeroVideo = useMemo(() => {
    if (promotedVideoId && promotedVideoId !== featuredVideo?.id) {
      return videos.find((v) => v.id === promotedVideoId) ?? featuredVideo;
    }
    return featuredVideo;
  }, [promotedVideoId, featuredVideo, videos]);

  const isPromoted = !!promotedVideoId && promotedVideoId !== featuredVideo?.id;

  const handlePromote = useCallback(
    (item: MediaItem) => {
      onPromote?.(item.id);
      // Mobile auto-scroll to hero
      if (!isDesktop && heroRef.current) {
        scrollTo(heroRef.current, { offset: 80 });
      }
    },
    [onPromote, isDesktop, scrollTo]
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const v of videos) {
      const cat = v.category || "Uncategorized";
      counts.set(cat, (counts.get(cat) || 0) + 1);
    }
    return counts;
  }, [videos]);

  const categories = useMemo(
    () => Array.from(categoryCounts.keys()).sort(),
    [categoryCounts]
  );

  const filtered = useMemo(() => {
    const items =
      categoryFilter === null
        ? videos
        : videos.filter(
            (v) => (v.category || "Uncategorized") === categoryFilter
          );
    // Exclude hero video (featured and/or promoted) from the grid
    const excludeIds = new Set<string>();
    if (featuredVideo) excludeIds.add(featuredVideo.id);
    if (promotedVideoId) excludeIds.add(promotedVideoId);
    return excludeIds.size > 0
      ? items.filter((v) => !excludeIds.has(v.id))
      : items;
  }, [videos, categoryFilter, featuredVideo, promotedVideoId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-surface-alt h-64 animate-pulse rounded-2xl sm:h-80" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <VideoCardSkeleton />
          <VideoCardSkeleton />
          <VideoCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Video — shown when resolved hero exists (not gated by category filter) */}
      {resolvedHeroVideo && (
        <FeaturedVideoHero
          key={resolvedHeroVideo.id}
          ref={heroRef}
          video={resolvedHeroVideo}
          isPromoted={isPromoted}
        />
      )}

      {/* Category Filter Chips */}
      {categories.length > 1 && (
        <div className="scrollbar-hide -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <FilterChip
            label="All"
            active={categoryFilter === null}
            count={videos.length}
            colorScheme="pink"
            onClick={() => setCategoryFilter(null)}
          />
          {categories.map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              active={categoryFilter === cat}
              count={categoryCounts.get(cat)}
              colorScheme="pink"
              onClick={() => setCategoryFilter(cat)}
              onClear={
                categoryFilter === cat
                  ? () => setCategoryFilter(null)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Video Grid */}
      <VideoGrid
        items={filtered}
        categoryFilter={categoryFilter}
        selectedVideoId={promotedVideoId}
        onVideoSelect={handlePromote}
      />

      {/* Empty State */}
      {videos.length === 0 && !isLoading && (
        <div className="border-hairline bg-canvas flex flex-col items-center rounded-lg border py-20 text-center">
          <Film
            size={48}
            className="text-bougainvillea-pink mb-4 opacity-60"
            aria-hidden="true"
          />
          <h3 className="text-body mb-2 text-lg font-semibold">
            No videos available yet
          </h3>
          <p className="text-muted mb-6 max-w-sm text-sm">
            Share videos celebrating Brava&apos;s culture, landscapes, and
            community stories.
          </p>
          <a
            href="/contribute/media"
            className="bg-bougainvillea-pink hover:bg-bougainvillea-pink/90 rounded-button inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition-all active:scale-95"
          >
            Be the first to share
          </a>
        </div>
      )}
    </div>
  );
}
