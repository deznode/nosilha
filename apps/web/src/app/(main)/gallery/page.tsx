"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Image as ImageIcon, Play, Plus } from "lucide-react";
import {
  PhotoGrid,
  PhotoGridSkeleton,
  VideoSection,
  Lightbox,
} from "@/components/gallery";
import { getCuratedMedia, getApprovedMedia } from "@/lib/api";
import type { MediaItem, MediaCategory } from "@/types/media";
import type { CuratedMedia } from "@/types/curated-media";
import type { MediaMetadataDto } from "@/types/api";

/**
 * Maps CuratedMedia from API to MediaItem expected by gallery components
 */
function mapCuratedMediaToMediaItem(media: CuratedMedia): MediaItem {
  // Map category to MediaCategory type (using first available or fallback)
  const categoryMap: Record<string, MediaCategory> = {
    Landmark: "Landmark",
    Historical: "Historical",
    Nature: "Nature",
    Culture: "Culture",
    Event: "Event",
    Interview: "Interview",
  };
  const category = categoryMap[media.category] || "Culture";

  // For YouTube videos, generate thumbnail URL if not provided
  let thumbnailUrl = media.thumbnailUrl;
  if (!thumbnailUrl && media.platform === "YOUTUBE" && media.externalId) {
    thumbnailUrl = `https://img.youtube.com/vi/${media.externalId}/maxresdefault.jpg`;
  }

  // For video content, use embedUrl from API (already resolved by backend)
  // For images, use the direct url
  const url = media.mediaType === "VIDEO"
    ? (media.embedUrl || media.url || "")
    : (media.url || "");

  return {
    id: media.id,
    type: media.mediaType as "IMAGE" | "VIDEO",
    url,
    thumbnailUrl: thumbnailUrl || undefined,
    title: media.title,
    description: media.description || undefined,
    category,
    author: media.author || undefined,
    date: new Date(media.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    }),
  };
}

/**
 * Maps user-uploaded media (MediaMetadataDto) to MediaItem for gallery display.
 * This is the Anti-Corruption Layer between the Media bounded context and gallery UI.
 */
function mapUserMediaToMediaItem(media: MediaMetadataDto): MediaItem {
  // Map category string to MediaCategory type
  const categoryMap: Record<string, MediaCategory> = {
    Landmark: "Landmark",
    Historical: "Historical",
    Nature: "Nature",
    Culture: "Culture",
    Event: "Event",
    Interview: "Interview",
  };
  const category = categoryMap[media.category || ""] || "Culture";

  // Determine type based on content type
  const isVideo = media.contentType?.startsWith("video/");
  const type: "IMAGE" | "VIDEO" = isVideo ? "VIDEO" : "IMAGE";

  return {
    id: media.id,
    type,
    url: media.publicUrl || "",
    thumbnailUrl: undefined, // User uploads don't have separate thumbnails
    title: media.originalName || media.fileName,
    description: media.description || undefined,
    category,
    author: media.uploadedBy || "Community Contributor",
    date: media.createdAt
      ? new Date(media.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        })
      : undefined,
    source: "user" as const, // Mark source for potential UI differentiation
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
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);

  useEffect(() => {
    async function loadMedia() {
      setIsLoading(true);
      try {
        // Fetch from both sources: curated media and user-uploaded approved media
        const [curatedPhotos, curatedVideos, userPhotos] = await Promise.all([
          getCuratedMedia({ mediaType: "IMAGE", size: 50 }),
          getCuratedMedia({ mediaType: "VIDEO", size: 20 }),
          getApprovedMedia({ contentType: "image/", size: 50 }),
        ]);

        // Map curated media
        const curatedPhotoItems = curatedPhotos.items.map(mapCuratedMediaToMediaItem);
        const curatedVideoItems = curatedVideos.items.map(mapCuratedMediaToMediaItem);

        // Map user-uploaded photos (filter to images only)
        const userPhotoItems = userPhotos.items
          .filter((m) => m.contentType?.startsWith("image/"))
          .map(mapUserMediaToMediaItem);

        // Merge both photo sources (curated first, then user-uploaded)
        const allPhotos = [...curatedPhotoItems, ...userPhotoItems];

        setPhotos(allPhotos);
        setVideos(curatedVideoItems);
      } catch (error) {
        console.error("Failed to load media:", error);
        // Set empty arrays on error to show "no content" message
        setPhotos([]);
        setVideos([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadMedia();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-12 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="mb-4 font-serif text-3xl font-bold md:text-5xl">
            Brava Media Center
          </h1>
          <p className="max-w-2xl text-lg font-light text-slate-300">
            A visual archive of our island. Explore historical photographs,
            community moments, and videos celebrating the culture of Brava.
          </p>
          <div className="mt-6">
            <Link
              href="/contribute/media"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-ocean-blue)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-ocean-blue-deep)] focus:ring-2 focus:ring-white/50 focus:outline-none"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add to Archive</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("photos")}
              className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "photos"
                  ? "border-[var(--color-ocean-blue)] text-[var(--color-ocean-blue)]"
                  : "border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
              }`}
            >
              <ImageIcon size={18} /> Photo Gallery
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "videos"
                  ? "border-[var(--color-bougainvillea)] text-[var(--color-bougainvillea)]"
                  : "border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
              }`}
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
            <PhotoGridSkeleton />
          ) : (
            <PhotoGrid
              photos={photos}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              onPhotoClick={setSelectedImage}
            />
          ))}

        {/* Video Archive */}
        {activeTab === "videos" && (
          <VideoSection videos={videos} isLoading={isLoading} />
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <Lightbox
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
