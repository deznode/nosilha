"use client";

import { Film } from "lucide-react";
import { formatDuration } from "@/lib/format-duration";
import { YouTubeFacade } from "@/components/gallery/youtube-facade";
import type { MediaItem } from "@/types/media";

interface FeaturedVideoHeroProps {
  video: MediaItem | null | undefined;
}

export function FeaturedVideoHero({ video }: FeaturedVideoHeroProps) {
  if (!video) return null;

  return (
    <div className="rounded-container relative h-64 overflow-hidden sm:h-80 lg:h-96">
      {/* YouTubeFacade handles thumbnail + play → iframe */}
      <YouTubeFacade video={video} />

      {/* Gradient overlay — pointer-events-none so clicks pass through to facade */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Metadata overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-6">
        <div className="mb-2 flex items-center gap-1.5">
          <Film size={14} className="text-bougainvillea-pink" />
          <span className="text-bougainvillea-pink text-xs font-bold tracking-wider uppercase">
            Featured Video
          </span>
        </div>
        <h2 className="text-lg font-bold text-white sm:text-xl">
          {video.title}
        </h2>
        <div className="mt-1 flex items-center gap-2 text-sm text-white/70">
          {video.author && <span>{video.author}</span>}
          {video.author && video.duration != null && <span>&bull;</span>}
          {video.duration != null && (
            <span>{formatDuration(video.duration)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
