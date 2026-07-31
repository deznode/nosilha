"use client";

import Image from "next/image";
import { clsx } from "clsx";
import { Camera, Play } from "lucide-react";

interface GalleryMapMarkerProps {
  thumbnailUrl: string | null;
  title: string;
  isSelected: boolean;
  onClick: () => void;
  mediaType?: "IMAGE" | "VIDEO";
}

/**
 * Photo/Video thumbnail marker for the gallery map.
 * 48x48px rounded image with a subtle pin nub below and video indicator badge.
 */
export function GalleryMapMarker({
  thumbnailUrl,
  title,
  isSelected,
  onClick,
  mediaType,
}: GalleryMapMarkerProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={clsx(
        "relative flex cursor-pointer flex-col items-center",
        "ease-calm transition-transform duration-200",
        isSelected ? "z-50 scale-110" : "z-10 hover:z-40 hover:scale-105"
      )}
      aria-label={`View ${mediaType === "VIDEO" ? "video" : "photo"}: ${title}`}
    >
      {/* Thumbnail circle */}
      <div
        className={clsx(
          "shadow-medium relative h-12 w-12 overflow-hidden rounded-full border-2",
          isSelected ? "border-brand ring-brand/30 ring-2" : "border-white"
        )}
      >
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            width={48}
            height={48}
            sizes="48px"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="bg-surface-alt flex h-full w-full items-center justify-center">
            <Camera className="text-muted h-5 w-5" />
          </div>
        )}

        {/* Video Play Badge */}
        {mediaType === "VIDEO" && (
          <div className="bg-brand absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <Play className="fill-white text-white drop-shadow" size={14} />
          </div>
        )}
      </div>
      {/* Pin nub */}
      <div
        className={clsx(
          "h-0 w-0 border-t-[8px] border-r-[6px] border-l-[6px] border-r-transparent border-l-transparent",
          isSelected ? "border-t-brand" : "border-t-white"
        )}
      />
    </button>
  );
}
