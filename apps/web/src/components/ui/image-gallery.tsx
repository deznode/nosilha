"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import type { Photo } from "@/components/ui/image-lightbox";

interface ImageGalleryProps {
  photos: Photo[];
}

export function ImageGallery({ photos }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="border-border-primary bg-background-secondary flex h-48 items-center justify-center rounded-lg border-2 border-dashed">
        <p className="text-text-tertiary text-center text-sm">
          No images have been uploaded for this location yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, index) => (
          <button
            key={photo.id || index}
            type="button"
            onClick={() => {
              setLightboxIndex(index);
              setLightboxOpen(true);
            }}
            className="focus-ring group relative aspect-square w-full cursor-pointer overflow-hidden rounded-lg"
            aria-label={`View ${photo.alt}`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={400}
              height={400}
              className="h-full w-full object-cover shadow-md transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/30">
              <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </div>
          </button>
        ))}
      </div>

      <ImageLightbox
        photos={photos}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
