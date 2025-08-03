"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { 
  MapPinIcon,
  CalendarIcon,
  EyeIcon,
  ShareIcon
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
          <div key={index} className="bg-background-primary rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
            <div 
              className="relative aspect-[4/3] overflow-hidden cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={() => openLightbox(index)}
                  className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                  aria-label="View full size"
                >
                  <EyeIcon className="h-4 w-4 text-text-primary" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center gap-4 mb-2 text-xs text-text-secondary">
                <span className="flex items-center">
                  <MapPinIcon className="h-3 w-3 mr-1" />
                  {photo.location}
                </span>
                <span className="flex items-center">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {photo.date}
                </span>
              </div>
              
              <p className="text-sm text-text-secondary mb-3">
                {photo.description}
              </p>
              
              <button className="text-xs text-ocean-blue hover:text-ocean-blue/80 font-medium flex items-center">
                <ShareIcon className="h-3 w-3 mr-1" />
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