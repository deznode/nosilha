"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Image as ImageIcon, Play, Plus } from "lucide-react";
import { clsx } from "clsx";
import {
  MasonryPhotoGrid,
  MasonryPhotoGridSkeleton,
  VideoSection,
} from "@/components/gallery";
import { getGalleryMedia } from "@/lib/api";
import type { MediaItem, MediaCategory } from "@/types/media";
import type { PublicGalleryMedia } from "@/types/gallery";

const CATEGORY_MAP: Record<string, MediaCategory> = {
  Heritage: "Heritage",
  Landmark: "Heritage",
  Historical: "Historical",
  Nature: "Nature",
  Culture: "Culture",
  Event: "Event",
  Interview: "Interview",
};

/** Maps public GalleryMedia to the MediaItem shape used by gallery components. */
function mapGalleryMediaToMediaItem(media: PublicGalleryMedia): MediaItem {
  const category = CATEGORY_MAP[media.category || ""] || "Culture";
  const date = new Date(media.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
  const base = {
    id: media.id,
    title: media.title || "Untitled",
    description: media.description || undefined,
    category,
    date,
  };

  if (media.mediaSource === "EXTERNAL") {
    let thumbnailUrl = media.thumbnailUrl;
    if (!thumbnailUrl && media.platform === "YOUTUBE" && media.externalId) {
      thumbnailUrl = `https://img.youtube.com/vi/${media.externalId}/maxresdefault.jpg`;
    }

    const url =
      media.mediaType === "VIDEO"
        ? media.embedUrl || media.url || ""
        : media.url || "";

    return {
      ...base,
      type: media.mediaType as "IMAGE" | "VIDEO",
      url,
      thumbnailUrl: thumbnailUrl || undefined,
      author: media.author || media.curatorDisplayName || undefined,
      creditPlatform: media.creditPlatform,
      creditHandle: media.creditHandle,
    };
  }

  return {
    ...base,
    type: "IMAGE",
    url: media.publicUrl || "",
    author:
      media.photographerCredit ||
      media.uploaderDisplayName ||
      "Community Contributor",
    creditPlatform: media.creditPlatform,
    creditHandle: media.creditHandle,
    source: "user" as const,
  };
}

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<MediaCategory | "All">(
    "All"
  );

  useEffect(() => {
    async function loadMedia() {
      setIsLoading(true);
      try {
        const galleryResponse = await getGalleryMedia({ size: 100 });
        const allItems = galleryResponse.items.map(mapGalleryMediaToMediaItem);

        setPhotos(allItems.filter((item) => item.type === "IMAGE"));
        setVideos(allItems.filter((item) => item.type === "VIDEO"));
      } catch (error) {
        console.error("Failed to load media:", error);
        setPhotos([]);
        setVideos([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadMedia();
  }, []);

  return (
    <div className="bg-canvas min-h-screen pb-12">
      {/* Header */}
      <div className="bg-basalt-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="mb-4 font-serif text-3xl font-bold md:text-5xl">
                Brava Media Center
              </h1>
              <p className="max-w-2xl text-lg font-light text-white/70">
                A visual archive of our island. Explore historical photographs,
                community moments, and videos celebrating the culture of Brava.
              </p>
            </div>
            <Link
              href="/contribute/media"
              className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-button shadow-subtle flex shrink-0 items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition-all active:scale-95"
            >
              <Plus size={18} />
              Add to Archive
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-hairline bg-canvas shadow-subtle sticky top-16 z-30 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("photos")}
              className={clsx(
                "flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium",
                activeTab === "photos"
                  ? "border-ocean-blue text-ocean-blue"
                  : "text-muted hover:border-hairline hover:text-body border-transparent"
              )}
            >
              <ImageIcon size={18} /> Photo Gallery
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={clsx(
                "flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium",
                activeTab === "videos"
                  ? "border-bougainvillea-pink text-bougainvillea-pink"
                  : "text-muted hover:border-hairline hover:text-body border-transparent"
              )}
            >
              <Play size={18} /> Video & Podcasts
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Photo Gallery */}
        {activeTab === "photos" &&
          (isLoading ? (
            <MasonryPhotoGridSkeleton />
          ) : (
            <MasonryPhotoGrid
              photos={photos}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
            />
          ))}

        {/* Video Archive */}
        {activeTab === "videos" && (
          <VideoSection videos={videos} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
