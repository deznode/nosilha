"use client";

import { useEffect, useCallback } from "react";
import { X, Download } from "lucide-react";
import Image from "next/image";
import type { MediaItem } from "@/types/media";

interface LightboxProps {
  image: MediaItem;
  onClose: () => void;
}

export function Lightbox({ image, onClose }: LightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = image.url;
    link.download = `${image.title?.replace(/[^a-z0-9]/gi, "-") || "brava-photo"}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="hover:text-mist-200 absolute top-4 right-4 z-10 rounded-full p-2 text-white transition-colors hover:bg-white/10 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/90 focus:outline-none"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <X size={32} />
      </button>

      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex flex-grow items-center justify-center overflow-hidden">
          <div className="relative h-[60vh] w-full">
            <Image
              src={image.url}
              alt={image.title}
              fill
              className="rounded-t-lg object-contain"
              unoptimized // For external URLs
            />
          </div>
        </div>
        <div className="bg-canvas rounded-b-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-body text-xl font-bold">
                {image.title}
              </h2>
              <p className="text-muted mt-1">{image.description}</p>
            </div>
            <div className="text-right">
              <span className="text-ocean-blue block text-sm font-medium">
                {image.category}
              </span>
              <span className="text-muted mt-1 block text-xs">
                {image.date}
              </span>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleDownload}
              className="bg-basalt-800 hover:bg-basalt-500 focus:ring-ocean-blue inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:ring-2 focus:outline-none"
              aria-label="Download image"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
