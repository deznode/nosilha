"use client";

import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play, Mic, Film } from "lucide-react";
import { clsx } from "clsx";
import { pageStagger, pageItem } from "@/lib/animation/variants";
import { YouTubeFacade } from "@/components/gallery/youtube-facade";
import type { MediaItem } from "@/types/media";

interface VideoSectionProps {
  videos: MediaItem[];
  isLoading?: boolean;
}

function VideoCardSkeleton() {
  return (
    <div className="border-hairline bg-canvas animate-pulse overflow-hidden rounded-lg border shadow-sm">
      <div className="bg-surface-alt relative pb-[56.25%]" />
      <div className="p-5">
        <div className="bg-surface-alt mb-2 h-3 w-20 rounded" />
        <div className="bg-surface-alt mb-2 h-6 w-3/4 rounded" />
        <div className="bg-surface-alt h-4 w-full rounded" />
      </div>
    </div>
  );
}

function isPodcast(video: MediaItem): boolean {
  return (
    video.category === "Interview" ||
    (video.title?.toLowerCase().includes("podcast") ?? false) ||
    (video.title?.toLowerCase().includes("interview") ?? false)
  );
}

export function VideoSection({ videos, isLoading }: VideoSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Extract unique categories with counts
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

  // Filter by category
  const filtered = useMemo(
    () =>
      categoryFilter === "All"
        ? videos
        : videos.filter(
            (v) => (v.category || "Uncategorized") === categoryFilter
          ),
    [videos, categoryFilter]
  );

  // Split into videos vs podcasts
  const videoItems = useMemo(
    () => filtered.filter((v) => !isPodcast(v)),
    [filtered]
  );
  const podcastItems = useMemo(() => filtered.filter(isPodcast), [filtered]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="bg-surface-alt h-24 animate-pulse rounded-lg md:col-span-2" />
        <VideoCardSkeleton />
        <VideoCardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Category Filter Pills */}
      {categories.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCategoryFilter("All")}
            aria-pressed={categoryFilter === "All"}
            className={clsx(
              "min-h-[44px] rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              categoryFilter === "All"
                ? "border-bougainvillea-pink bg-bougainvillea-pink text-white"
                : "border-hairline bg-canvas text-muted hover:bg-surface"
            )}
          >
            All ({videos.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              aria-pressed={categoryFilter === cat}
              className={clsx(
                "min-h-[44px] rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                categoryFilter === cat
                  ? "border-bougainvillea-pink bg-bougainvillea-pink text-white"
                  : "border-hairline bg-canvas text-muted hover:bg-surface"
              )}
            >
              {cat} ({categoryCounts.get(cat) || 0})
            </button>
          ))}
        </div>
      )}

      {/* Featured banner */}
      <div className="border-bougainvillea-pink/20 bg-bougainvillea-pink/10 flex items-start gap-4 rounded-lg border p-6">
        <div className="bg-bougainvillea-pink flex-shrink-0 rounded-full p-2 text-white">
          <Play size={24} />
        </div>
        <div>
          <h3 className="text-bougainvillea-pink text-lg font-bold">
            Nos Ilha Channel & Podcast
          </h3>
          <p className="text-body mt-1 text-sm">
            Watch cinematic views of Brava&apos;s landscapes and listen to our
            exclusive podcast series featuring interviews with elders about the
            &quot;Sodade&quot; of migration and life in the older times.
          </p>
        </div>
      </div>

      {/* Videos Section */}
      {filtered.length > 0 && (
        <div>
          <h3 className="text-body mb-4 flex items-center gap-2 text-lg font-bold">
            <Film size={20} className="text-bougainvillea-pink" />
            Videos ({videoItems.length})
          </h3>
          {videoItems.length > 0 ? (
            <motion.div
              variants={shouldReduceMotion ? undefined : pageStagger}
              initial={shouldReduceMotion ? undefined : "hidden"}
              animate={shouldReduceMotion ? undefined : "visible"}
              className="grid grid-cols-1 gap-8 md:grid-cols-2"
            >
              {videoItems.map((video, idx) => (
                <motion.div
                  key={video.id}
                  variants={shouldReduceMotion ? undefined : pageItem}
                  className={clsx(
                    "border-hairline bg-canvas overflow-hidden rounded-lg border shadow-sm",
                    "hover:shadow-elevated transition-shadow",
                    idx === 0 && "md:col-span-2"
                  )}
                >
                  <YouTubeFacade video={video} />
                  <div className="p-5">
                    <div className="mb-2 flex items-start justify-between">
                      {video.category && (
                        <span className="text-bougainvillea-pink text-xs font-bold tracking-wider uppercase">
                          {video.category}
                        </span>
                      )}
                      <span className="text-muted text-xs">{video.date}</span>
                    </div>
                    <h3 className="text-body mb-2 text-xl font-bold">
                      {video.title}
                    </h3>
                    <p className="text-muted text-sm">{video.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-muted py-6 text-center text-sm">
              No videos in this category.
            </p>
          )}
        </div>
      )}

      {/* Podcasts & Interviews Section */}
      {filtered.length > 0 && (
        <div>
          <h3 className="text-body mb-4 flex items-center gap-2 text-lg font-bold">
            <Mic size={20} className="text-valley-green" />
            Podcasts & Interviews ({podcastItems.length})
          </h3>
          {podcastItems.length > 0 ? (
            <motion.div
              variants={shouldReduceMotion ? undefined : pageStagger}
              initial={shouldReduceMotion ? undefined : "hidden"}
              animate={shouldReduceMotion ? undefined : "visible"}
              className="grid grid-cols-1 gap-8 md:grid-cols-2"
            >
              {podcastItems.map((video, idx) => (
                <motion.div
                  key={video.id}
                  variants={shouldReduceMotion ? undefined : pageItem}
                  className={clsx(
                    "border-hairline bg-canvas overflow-hidden rounded-lg border shadow-sm",
                    "hover:shadow-elevated transition-shadow",
                    idx === 0 && "md:col-span-2"
                  )}
                >
                  <YouTubeFacade video={video} />
                  <div className="p-5">
                    <div className="mb-2 flex items-start justify-between">
                      <span className="text-valley-green text-xs font-bold tracking-wider uppercase">
                        <Mic size={10} className="mr-1 inline" />
                        PODCAST
                      </span>
                      <span className="text-muted text-xs">{video.date}</span>
                    </div>
                    <h3 className="text-body mb-2 text-xl font-bold">
                      {video.title}
                    </h3>
                    <p className="text-muted text-sm">{video.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-muted py-6 text-center text-sm">
              No podcasts or interviews in this category.
            </p>
          )}
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="border-hairline bg-canvas flex flex-col items-center rounded-lg border py-20 text-center">
          <Film
            size={48}
            className="text-bougainvillea-pink mb-4 opacity-60"
            aria-hidden="true"
          />
          <h3 className="text-body mb-2 text-lg font-semibold">
            {categoryFilter !== "All"
              ? `No ${categoryFilter.toLowerCase()} videos found`
              : "No videos available yet"}
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
