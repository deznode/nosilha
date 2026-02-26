"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";
import { mapGalleryMediaToMediaItem } from "@/lib/gallery-mappers";
import { mediaItemToPhoto } from "@/components/gallery/masonry-photo-grid";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import type { Photo } from "@/components/ui/image-lightbox";
import type { PublicGalleryMedia } from "@/types/gallery";
import { useState, useMemo } from "react";

interface WeeklyDiscoverySectionProps {
  photos: PublicGalleryMedia[];
}

function resolveThumbUrl(photo: PublicGalleryMedia): string | null {
  if (photo.mediaSource === "USER_UPLOAD" && "publicUrl" in photo) {
    return photo.publicUrl ?? null;
  }
  if (photo.mediaSource === "EXTERNAL" && "thumbnailUrl" in photo) {
    return photo.thumbnailUrl ?? null;
  }
  return null;
}

export function WeeklyDiscoverySection({
  photos,
}: WeeklyDiscoverySectionProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const lightboxPhotos: Photo[] = useMemo(
    () =>
      photos.map((p) => {
        const item = mapGalleryMediaToMediaItem(p);
        return mediaItemToPhoto(item);
      }),
    [photos]
  );

  if (photos.length < 3) return null;

  return (
    <>
      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={18} className="text-sunny-yellow" />
          <h2 className="text-body text-sm font-bold uppercase tracking-wider">
            This Week&apos;s Discoveries
          </h2>
        </div>
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-0 sm:px-0">
          {photos.map((photo, index) => {
            const thumbUrl = resolveThumbUrl(photo);
            if (!thumbUrl) return null;

            return (
              <button
                key={photo.id}
                onClick={() => setLightboxIndex(index)}
                className="group relative w-48 flex-shrink-0 snap-start overflow-hidden rounded-card sm:w-56"
              >
                <div className="relative h-32 w-full sm:h-40">
                  <Image
                    src={thumbUrl}
                    alt={photo.altText ?? photo.title ?? "Gallery photo"}
                    fill
                    sizes="224px"
                    className="object-cover transition-transform duration-300 ease-calm group-hover:scale-105"
                  />
                </div>
                <div className="bg-surface border-hairline border-x border-b p-2">
                  <p className="text-body truncate text-sm font-medium">
                    {photo.title}
                  </p>
                  {photo.category && (
                    <span className="bg-surface-alt text-muted mt-1 inline-block rounded-badge px-2 py-0.5 text-xs">
                      {photo.category}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {lightboxIndex !== null && (
        <ImageLightbox
          photos={lightboxPhotos}
          initialIndex={lightboxIndex}
          isOpen={true}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
