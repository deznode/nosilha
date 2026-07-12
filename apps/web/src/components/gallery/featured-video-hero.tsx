"use client";

import * as React from "react";
import { clsx } from "clsx";
import { Film } from "lucide-react";
import { formatDuration } from "@/lib/format-duration";
import {
  YouTubeFacade,
  type DeactivateRef,
} from "@/components/gallery/youtube-facade";
import type { MediaItem } from "@/types/media";

interface FeaturedVideoHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  video: MediaItem | null | undefined;
  /** When true, shows "Now Playing" label instead of "Featured Video" */
  isPromoted?: boolean;
  /** Shared ref for single-video-at-a-time enforcement */
  deactivateRef?: DeactivateRef;
  /** When true, renders a YouTube iframe directly instead of the facade poster */
  nativePlayer?: boolean;
}

/**
 * Hero player for the gallery video section.
 * Use `key={video.id}` on this component to reset YouTubeFacade when the video changes.
 */
export const FeaturedVideoHero = React.forwardRef<
  HTMLDivElement,
  FeaturedVideoHeroProps
>(
  (
    { video, isPromoted, deactivateRef, nativePlayer, className, ...props },
    ref
  ) => {
    if (!video) return null;

    const iframeSrc = video.url
      ? video.url +
        (video.url.includes("?") ? "&" : "?") +
        "rel=0&playsinline=1"
      : "";

    return (
      <div
        ref={ref}
        className={clsx("relative aspect-video overflow-hidden", className)}
        {...props}
      >
        {/* Native iframe for mobile; facade with poster for desktop */}
        {nativePlayer ? (
          <iframe
            src={iframeSrc}
            title={video.title || "Video player"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <YouTubeFacade
            video={video}
            autoPlay={isPromoted}
            deactivateRef={deactivateRef}
            priority
          />
        )}

        {/* Gradient overlay — pointer-events-none so clicks pass through to facade */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Metadata overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-6">
          <div className="mb-2 flex items-center gap-1.5">
            <Film size={14} className="text-bougainvillea-pink" />
            <span className="text-bougainvillea-pink text-[13px] font-bold tracking-wider uppercase">
              {isPromoted ? "Now Playing" : "Featured Video"}
            </span>
          </div>
          <h2 className="line-clamp-2 text-lg font-bold text-white sm:text-xl">
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
);
FeaturedVideoHero.displayName = "FeaturedVideoHero";
