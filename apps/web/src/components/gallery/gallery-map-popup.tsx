"use client";

import Image from "next/image";
import { Camera, ExternalLink } from "lucide-react";
import type { MediaItem } from "@/types/media";

interface GalleryMapPopupProps {
  photo: MediaItem;
  onOpenInGallery: (photo: MediaItem) => void;
  onClose: () => void;
}

/**
 * Popup card shown when clicking a photo marker on the gallery map.
 * Displays a small preview, title, location, date, and "Open in Gallery" action.
 */
export function GalleryMapPopup({
  photo,
  onOpenInGallery,
  onClose,
}: GalleryMapPopupProps) {
  const imageUrl = photo.thumbnailUrl ?? null;

  return (
    <div className="bg-surface border-hairline w-56 overflow-hidden rounded-card border shadow-elevated">
      {/* Photo preview */}
      <div className="relative h-32 w-full">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={photo.title}
            fill
            sizes="224px"
            className="object-cover"
          />
        ) : (
          <div className="bg-surface-alt flex h-full w-full items-center justify-center">
            <Camera className="text-muted h-8 w-8" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-body truncate text-sm font-medium">
          {photo.title}
        </h3>
        {photo.locationName && (
          <p className="text-muted mt-0.5 truncate text-xs">
            {photo.locationName}
          </p>
        )}
        {photo.date && (
          <p className="text-muted mt-0.5 text-xs">{photo.date}</p>
        )}

        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => onOpenInGallery(photo)}
            className="bg-brand/10 text-brand hover:bg-brand/20 flex flex-1 items-center justify-center gap-1 rounded-button px-2 py-1.5 text-xs font-medium transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Open in Gallery
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:bg-surface-alt rounded-button px-2 py-1.5 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
