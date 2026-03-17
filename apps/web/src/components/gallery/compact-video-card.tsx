"use client";

import { motion } from "framer-motion";
import { Film, Mic } from "lucide-react";
import { listItem } from "@/lib/animation/variants";
import { formatDuration } from "@/lib/format-duration";
import { YouTubeFacade } from "@/components/gallery/youtube-facade";
import type { MediaItem } from "@/types/media";

function isPodcast(item: MediaItem): boolean {
  if (item.category === "Interview") return true;
  const title = item.title.toLowerCase();
  return title.includes("podcast") || title.includes("interview");
}

interface CompactVideoCardProps {
  item: MediaItem;
}

export function CompactVideoCard({ item }: CompactVideoCardProps) {
  const podcast = isPodcast(item);

  return (
    <motion.div
      variants={listItem}
      className={`rounded-card bg-canvas shadow-subtle overflow-hidden${
        podcast ? "border-valley-green border-l-4" : ""
      }`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden">
        <YouTubeFacade video={item} />

        {/* Duration badge */}
        {item.duration != null && (
          <span className="bg-basalt-900/80 pointer-events-none absolute right-2 bottom-2 rounded px-2 py-1 text-xs text-white backdrop-blur-sm">
            {formatDuration(item.duration)}
          </span>
        )}

        {/* Podcast mic icon overlay */}
        {podcast && (
          <span className="bg-valley-green/90 pointer-events-none absolute top-2 left-2 rounded p-1 text-white">
            <Mic size={14} />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1 p-3">
        {/* Category badge */}
        <div className="flex items-center gap-1.5">
          {podcast ? (
            <span className="text-valley-green text-[11px] font-semibold tracking-wider uppercase">
              Podcast
            </span>
          ) : (
            <>
              <Film size={12} className="text-bougainvillea-pink" />
              <span className="text-bougainvillea-pink text-[11px] font-semibold tracking-wider uppercase">
                {item.category || "Video"}
              </span>
            </>
          )}
        </div>

        {/* Title — 2-line clamp */}
        <h3 className="text-body line-clamp-2 text-sm leading-snug font-medium">
          {item.title}
        </h3>

        {/* Author */}
        {item.author && (
          <p className="text-muted truncate text-xs">{item.author}</p>
        )}
      </div>
    </motion.div>
  );
}
