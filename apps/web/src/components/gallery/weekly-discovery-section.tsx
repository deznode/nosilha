"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Play, Sparkles } from "lucide-react";
import {
  mapGalleryMediaToMediaItem,
  resolvePublicImageUrl,
} from "@/lib/gallery-mappers";
import { mediaItemToPhoto } from "@/components/gallery/masonry-photo-grid";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import type { Photo } from "@/components/ui/image-lightbox";
import type { PublicGalleryMedia } from "@/types/gallery";
import { isPublicExternalMedia } from "@/types/gallery";

interface WeeklyDiscoverySectionProps {
  photos: PublicGalleryMedia[];
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
          <h2 className="text-body text-sm font-bold tracking-wider uppercase">
            This Week&apos;s Discoveries
          </h2>
        </div>
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-0 sm:px-0">
          {photos.map((photo, index) => {
            const thumbUrl = resolvePublicImageUrl(photo);
            if (!thumbUrl) return null;
            const isVideoItem =
              isPublicExternalMedia(photo) && photo.mediaType === "VIDEO";

            return (
              <button
                key={photo.id}
                onClick={() => setLightboxIndex(index)}
                className="group rounded-card relative w-48 flex-shrink-0 snap-start overflow-hidden sm:w-56"
              >
                <div className="relative h-32 w-full sm:h-40">
                  <Image
                    src={thumbUrl}
                    alt={photo.altText ?? photo.title ?? "Gallery photo"}
                    fill
                    sizes="224px"
                    className="ease-calm object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {isVideoItem && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <span className="shadow-elevated bg-bougainvillea-pink flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:scale-110">
                        <Play size={18} className="ml-0.5" />
                      </span>
                    </div>
                  )}
                </div>
                <div className="bg-surface border-hairline flex min-h-[3.5rem] flex-col justify-center border-x border-b p-2">
                  <p className="text-body truncate text-sm font-medium">
                    {photo.title}
                  </p>
                  {photo.category && (
                    <span className="bg-surface-alt text-muted rounded-badge mt-1 inline-block px-2 py-0.5 text-xs">
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
