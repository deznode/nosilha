"use client";

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

export function VideoSection({ videos, isLoading }: VideoSectionProps) {
  const shouldReduceMotion = useReducedMotion();

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
    <motion.div
      variants={shouldReduceMotion ? undefined : pageStagger}
      initial={shouldReduceMotion ? undefined : "hidden"}
      animate={shouldReduceMotion ? undefined : "visible"}
      className="grid grid-cols-1 gap-8 md:grid-cols-2"
    >
      {/* Featured banner */}
      <motion.div
        variants={shouldReduceMotion ? undefined : pageItem}
        className="border-bougainvillea-pink/20 bg-bougainvillea-pink/10 mb-4 flex items-start gap-4 rounded-lg border p-6 md:col-span-2"
      >
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
      </motion.div>

      {/* Video Cards */}
      {videos.map((video) => (
        <motion.div
          key={video.id}
          variants={shouldReduceMotion ? undefined : pageItem}
          className={clsx(
            "border-hairline bg-canvas overflow-hidden rounded-lg border shadow-sm",
            "hover:shadow-elevated transition-shadow"
          )}
        >
          <YouTubeFacade video={video} />
          <div className="p-5">
            <div className="mb-2 flex items-start justify-between">
              <span
                className={clsx(
                  "text-xs font-bold tracking-wider uppercase",
                  video.category === "Interview"
                    ? "text-valley-green"
                    : "text-bougainvillea-pink"
                )}
              >
                {video.category === "Interview" ? (
                  <>
                    <Mic size={10} className="mr-1 inline" />
                    PODCAST
                  </>
                ) : (
                  video.category
                )}
              </span>
              <span className="text-muted text-xs">{video.date}</span>
            </div>
            <h3 className="text-body mb-2 text-xl font-bold">{video.title}</h3>
            <p className="text-muted text-sm">{video.description}</p>
          </div>
        </motion.div>
      ))}

      {videos.length === 0 && (
        <div className="border-hairline bg-canvas flex flex-col items-center rounded-lg border py-20 text-center md:col-span-2">
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
    </motion.div>
  );
}
