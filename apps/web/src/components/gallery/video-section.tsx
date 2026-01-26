"use client";

import { Play, Mic } from "lucide-react";
import type { MediaItem } from "@/types/media";

interface VideoSectionProps {
  videos: MediaItem[];
  isLoading?: boolean;
}

function VideoCardSkeleton() {
  return (
    <div className="border-hairline bg-canvas animate-pulse overflow-hidden rounded-lg border shadow-sm">
      <div className="bg-surface-alt relative pb-[56.25%]" />
      <div className="p-5">
        <div className="bg-surface-alt mb-2 h-3 w-20 rounded" />
        <div className="bg-surface-alt mb-2 h-6 w-3/4 rounded" />
        <div className="bg-surface-alt h-4 w-full rounded" />
      </div>
    </div>
  );
}

export function VideoSection({ videos, isLoading }: VideoSectionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="bg-surface-alt h-24 animate-pulse rounded-lg md:col-span-2" />
        <VideoCardSkeleton />
        <VideoCardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* Featured banner */}
      <div className="border-bougainvillea-pink/20 bg-bougainvillea-pink/10 mb-4 flex items-start gap-4 rounded-lg border p-6 md:col-span-2">
        <div className="bg-bougainvillea-pink flex-shrink-0 rounded-full p-2 text-white">
          <Play size={24} />
        </div>
        <div>
          <h3 className="text-bougainvillea-pink text-lg font-bold">
            Nos Ilha Channel & Podcast
          </h3>
          <p className="text-body mt-1 text-sm">
            Watch cinematic views of Brava's landscapes and listen to our
            exclusive podcast series featuring interviews with elders about the
            "Sodade" of migration and life in the older times.
          </p>
        </div>
      </div>

      {/* Video Cards */}
      {videos.map((video) => (
        <div
          key={video.id}
          className="border-hairline bg-canvas overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="relative bg-black pb-[56.25%]">
            <iframe
              className="absolute top-0 left-0 h-full w-full"
              src={video.url}
              title={video.title || "Video player"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="p-5">
            <div className="mb-2 flex items-start justify-between">
              <span
                className={`text-xs font-bold tracking-wider uppercase ${
                  video.category === "Interview"
                    ? "text-purple-600"
                    : "text-bougainvillea-pink"
                }`}
              >
                {video.category === "Interview" ? (
                  <>
                    <Mic size={10} className="mr-1 inline" />
                    PODCAST
                  </>
                ) : (
                  video.category
                )}
              </span>
              <span className="text-muted text-xs">{video.date}</span>
            </div>
            <h3 className="text-body mb-2 text-xl font-bold">
              {video.title}
            </h3>
            <p className="text-muted text-sm">{video.description}</p>
          </div>
        </div>
      ))}

      {videos.length === 0 && (
        <div className="border-hairline bg-canvas rounded-lg border py-20 text-center md:col-span-2">
          <p className="text-muted">No videos available yet.</p>
        </div>
      )}
    </div>
  );
}
