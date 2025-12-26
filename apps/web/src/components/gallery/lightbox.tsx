"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
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
        className="absolute top-4 right-4 z-10 p-2 text-white hover:text-slate-200"
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
        <div className="rounded-b-lg bg-white p-6 dark:bg-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {image.title}
              </h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                {image.description}
              </p>
            </div>
            <div className="text-right">
              <span className="block text-sm font-medium text-[var(--color-ocean-blue)]">
                {image.category}
              </span>
              <span className="mt-1 block text-xs text-slate-400 dark:text-slate-500">
                {image.date}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
