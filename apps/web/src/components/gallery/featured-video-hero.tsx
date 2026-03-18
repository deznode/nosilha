"use client";

import * as React from "react";
import { clsx } from "clsx";
import { Film } from "lucide-react";
import { formatDuration } from "@/lib/format-duration";
import { YouTubeFacade } from "@/components/gallery/youtube-facade";
import type { MediaItem } from "@/types/media";

interface FeaturedVideoHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  video: MediaItem | null | undefined;
  /** When true, shows "Now Playing" label instead of "Featured Video" */
  isPromoted?: boolean;
}

/**
 * Hero player for the gallery video section.
 * Use `key={video.id}` on this component to reset YouTubeFacade when the video changes.
 */
export const FeaturedVideoHero = React.forwardRef<
  HTMLDivElement,
  FeaturedVideoHeroProps
>(({ video, isPromoted, className, ...props }, ref) => {
  if (!video) return null;

  return (
    <div
      ref={ref}
      className={clsx(
        "rounded-container relative aspect-video overflow-hidden",
        className
      )}
      {...props}
    >
      {/* YouTubeFacade handles thumbnail + play → iframe */}
      <YouTubeFacade video={video} />

      {/* Gradient overlay — pointer-events-none so clicks pass through to facade */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Metadata overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-6">
        <div className="mb-2 flex items-center gap-1.5">
          <Film size={14} className="text-bougainvillea-pink" />
          <span className="text-bougainvillea-pink text-xs font-bold tracking-wider uppercase">
            {isPromoted ? "Now Playing" : "Featured Video"}
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
});
FeaturedVideoHero.displayName = "FeaturedVideoHero";
