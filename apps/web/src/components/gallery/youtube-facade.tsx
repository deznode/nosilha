"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { MediaItem } from "@/types/media";

interface YouTubeFacadeProps {
  video: MediaItem;
}

export function YouTubeFacade({ video }: YouTubeFacadeProps) {
  const [activated, setActivated] = useState(false);

  const thumbnailUrl = video.thumbnailUrl || "/images/video-placeholder.jpg";
  const iframeSrc = video.url
    ? video.url + (video.url.includes("?") ? "&" : "?") + "autoplay=1"
    : "";

  if (activated) {
    return (
      <div className="relative bg-black pb-[56.25%]">
        <iframe
          className="absolute top-0 left-0 h-full w-full"
          src={iframeSrc}
          title={video.title || "Video player"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="group/facade relative bg-black pb-[56.25%]">
      <Image
        src={thumbnailUrl}
        alt={video.title || "Video thumbnail"}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover/facade:scale-105"
      />
      <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover/facade:bg-black/40" />
      <button
        onClick={() => setActivated(true)}
        aria-label={`Play ${video.title || "video"}`}
        className="absolute inset-0 flex cursor-pointer items-center justify-center focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
      >
        <span className="shadow-elevated bg-bougainvillea-pink flex h-16 w-16 items-center justify-center rounded-full text-white transition-transform duration-300 group-hover/facade:scale-110">
          <Play size={28} className="ml-1" />
        </span>
      </button>
    </div>
  );
}
