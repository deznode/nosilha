"use client";

import { Play, Mic } from "lucide-react";
import type { MediaItem } from "@/types/media";

interface VideoSectionProps {
  videos: MediaItem[];
  isLoading?: boolean;
}

function VideoCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="relative bg-slate-200 pb-[56.25%] dark:bg-slate-700" />
      <div className="p-5">
        <div className="mb-2 h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mb-2 h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}

export function VideoSection({ videos, isLoading }: VideoSectionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="h-24 animate-pulse rounded-lg bg-slate-200 md:col-span-2 dark:bg-slate-700" />
        <VideoCardSkeleton />
        <VideoCardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* Featured banner */}
      <div className="mb-4 flex items-start gap-4 rounded-lg border border-pink-200 bg-pink-50 p-6 md:col-span-2 dark:border-pink-800/30 dark:bg-pink-900/20">
        <div className="flex-shrink-0 rounded-full bg-[var(--color-bougainvillea)] p-2 text-white">
          <Play size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[var(--color-bougainvillea)]">
            Nos Ilha Channel & Podcast
          </h3>
          <p className="mt-1 text-sm text-slate-900 dark:text-slate-200">
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
          className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="relative bg-black pb-[56.25%]">
            <iframe
              className="absolute top-0 left-0 h-full w-full"
              src={video.url}
              title={video.title}
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
                    : "text-[var(--color-bougainvillea)]"
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
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {video.date}
              </span>
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
              {video.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {video.description}
            </p>
          </div>
        </div>
      ))}

      {videos.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white py-20 text-center md:col-span-2 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-slate-500 dark:text-slate-400">
            No videos available yet.
          </p>
        </div>
      )}
    </div>
  );
}
