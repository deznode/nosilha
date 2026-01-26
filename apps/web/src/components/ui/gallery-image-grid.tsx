"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { MapPin, Calendar, Eye, Share2 } from "lucide-react";

interface Photo {
  src: string;
  alt: string;
  location: string;
  date: string;
  description: string;
}

interface GalleryImageGridProps {
  photos: Photo[];
}

export function GalleryImageGrid({ photos }: GalleryImageGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      {/* Masonry Image Grid */}
      <div className="columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="bg-canvas group break-inside-avoid overflow-hidden rounded-button shadow-subtle transition-shadow hover:shadow-elevated"
          >
            <div
              className="relative aspect-[4/3] cursor-pointer overflow-hidden"
              onClick={() => openLightbox(index)}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
              <div className="absolute top-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(index);
                  }}
                  className="rounded-full bg-white/90 p-2 shadow-elevated hover:bg-white"
                  aria-label="View full size"
                >
                  <Eye className="text-body h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="text-muted mb-2 flex items-center gap-4 text-xs">
                <span className="flex items-center">
                  <MapPin className="mr-1 h-3 w-3" />
                  {photo.location}
                </span>
                <span className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {photo.date}
                </span>
              </div>

              <p className="text-muted mb-3 text-sm">
                {photo.description}
              </p>

              <button className="text-ocean-blue hover:text-ocean-blue/80 flex items-center text-xs font-medium">
                <Share2 className="mr-1 h-3 w-3" />
                Share
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <ImageLightbox
        photos={photos}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
