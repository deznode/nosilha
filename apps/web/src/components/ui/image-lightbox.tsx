"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Download,
} from "lucide-react";

interface Photo {
  src: string;
  alt: string;
  location: string;
  date: string;
  description: string;
  highResSrc?: string;
  author?: string;
}

interface ImageLightboxProps {
  photos: Photo[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({
  photos,
  initialIndex,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Update current index when initial index changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  }, [photos.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, currentIndex, goToNext, goToPrevious, onClose]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && photos[currentIndex] && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-60 rounded-full bg-black/50 p-2 text-white transition-colors hover:scale-110 hover:bg-black/70 active:scale-95"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation buttons */}
          {photos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 z-60 rounded-full bg-black/50 p-2 text-white transition-colors hover:scale-110 hover:bg-black/70 active:scale-95"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-16 z-60 rounded-full bg-black/50 p-2 text-white transition-colors hover:scale-110 hover:bg-black/70 active:scale-95 lg:right-4"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Main content */}
          <div className="mx-auto flex h-full w-full max-w-7xl flex-col p-4 lg:flex-row lg:items-center lg:justify-center">
            {/* Image */}
            <div className="relative flex h-full flex-1 items-center justify-center">
              <div className="relative flex h-full w-full items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="relative h-full max-h-[70vh] w-full lg:max-h-[85vh]"
                  >
                    <Image
                      src={photos[currentIndex].src}
                      alt={photos[currentIndex].alt}
                      fill
                      className="object-contain"
                      priority
                      unoptimized
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Image info sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 rounded-lg bg-white/10 p-6 text-white backdrop-blur-md lg:mt-0 lg:ml-6 lg:max-h-[85vh] lg:w-80 lg:overflow-y-auto"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-white/70">
                  {currentIndex + 1} of {photos.length}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-lg font-medium">
                    {photos[currentIndex].description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-white/80">
                  <span className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4" />
                    {photos[currentIndex].location}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {photos[currentIndex].date}
                  </span>
                </div>
              </div>

              {/* Download Button */}
              <div className="mt-6 border-t border-white/20 pt-6">
                <a
                  href={
                    photos[currentIndex].highResSrc || photos[currentIndex].src
                  }
                  download={`brava-${photos[currentIndex].alt.replace(/\s+/g, "-").toLowerCase()}.jpg`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20"
                >
                  <Download className="h-4 w-4" />
                  Download High-Res
                </a>
                {photos[currentIndex].author && (
                  <p className="mt-2 text-center text-xs text-white/60">
                    Photo by {photos[currentIndex].author}
                  </p>
                )}
              </div>

              {/* Thumbnail navigation for desktop */}
              {photos.length > 1 && (
                <div className="mt-6 hidden lg:block">
                  <div className="grid grid-cols-4 gap-2">
                    {photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`relative aspect-square overflow-hidden rounded border-2 transition-all ${
                          index === currentIndex
                            ? "shadow-elevated scale-105 border-white"
                            : "border-transparent opacity-60 hover:border-white/50 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={photo.src}
                          alt={photo.alt}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Click outside to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={onClose}
            aria-label="Close lightbox"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
