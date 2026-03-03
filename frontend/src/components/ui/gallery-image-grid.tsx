"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import {
  MapPinIcon,
  CalendarIcon,
  EyeIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

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
      {/* Image Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="bg-background-primary group overflow-hidden rounded-lg shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              className="relative aspect-[4/3] cursor-pointer overflow-hidden"
              onClick={() => openLightbox(index)}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
              <div className="absolute top-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <button
                  onClick={() => openLightbox(index)}
                  className="rounded-full bg-white/90 p-2 shadow-lg hover:bg-white"
                  aria-label="View full size"
                >
                  <EyeIcon className="text-text-primary h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="text-text-secondary mb-2 flex items-center gap-4 text-xs">
                <span className="flex items-center">
                  <MapPinIcon className="mr-1 h-3 w-3" />
                  {photo.location}
                </span>
                <span className="flex items-center">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {photo.date}
                </span>
              </div>

              <p className="text-text-secondary mb-3 text-sm">
                {photo.description}
              </p>

              <button className="text-ocean-blue hover:text-ocean-blue/80 flex items-center text-xs font-medium">
                <ShareIcon className="mr-1 h-3 w-3" />
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
