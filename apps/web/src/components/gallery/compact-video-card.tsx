"use client";

import Image from "next/image";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { Film, Mic, Play } from "lucide-react";
import { listItem } from "@/lib/animation/variants";
import { formatDuration } from "@/lib/format-duration";
import type { MediaItem } from "@/types/media";

function isPodcast(item: MediaItem): boolean {
  if (item.category === "Interview") return true;
  const title = item.title.toLowerCase();
  return title.includes("podcast") || title.includes("interview");
}

interface CompactVideoCardProps {
  item: MediaItem;
  /** Called when the card is clicked to promote this video to the hero player */
  onSelect?: (item: MediaItem) => void;
  /** When true, shows a bougainvillea-pink ring highlight */
  isActive?: boolean;
}

export function CompactVideoCard({
  item,
  onSelect,
  isActive,
}: CompactVideoCardProps) {
  const podcast = isPodcast(item);
  const thumbnailUrl = item.thumbnailUrl || "/images/video-placeholder.jpg";

  const cardContent = (
    <>
      {/* Thumbnail */}
      <div className="group/card relative aspect-video w-full overflow-hidden">
        <Image
          src={thumbnailUrl}
          alt={item.title || "Video thumbnail"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />

        {/* Play icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover/card:bg-black/40">
          <span className="bg-bougainvillea-pink flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform duration-300 group-hover/card:scale-110">
            <Play size={18} className="ml-0.5" />
          </span>
        </div>

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
    </>
  );

  return (
    <motion.div
      variants={listItem}
      className={clsx(
        "rounded-card bg-canvas shadow-subtle overflow-hidden",
        podcast && "border-valley-green border-l-4",
        isActive && "ring-bougainvillea-pink ring-2"
      )}
    >
      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(item)}
          className="w-full cursor-pointer text-left"
          aria-label={`Play ${item.title}`}
        >
          {cardContent}
        </button>
      ) : (
        cardContent
      )}
    </motion.div>
  );
}
