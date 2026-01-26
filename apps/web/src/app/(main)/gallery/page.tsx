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
import { getGalleryMedia } from "@/lib/api";
import type { MediaItem, MediaCategory } from "@/types/media";
import type { GalleryMedia } from "@/types/gallery";

/**
 * Maps unified GalleryMedia to MediaItem expected by gallery components.
 * Handles both user uploads and external media in a type-safe way.
 */
function mapGalleryMediaToMediaItem(media: GalleryMedia): MediaItem {
  // Map category to MediaCategory type (using first available or fallback)
  const categoryMap: Record<string, MediaCategory> = {
    Heritage: "Heritage",
    Landmark: "Heritage", // Backward compatibility
    Historical: "Historical",
    Nature: "Nature",
    Culture: "Culture",
    Event: "Event",
    Interview: "Interview",
  };
  const category = categoryMap[media.category || ""] || "Culture";

  // Use discriminated union to handle different media sources
  if (media.mediaSource === "EXTERNAL") {
    // External media (YouTube, Vimeo, etc.)
    // For YouTube videos, generate thumbnail URL if not provided
    let thumbnailUrl = media.thumbnailUrl;
    if (!thumbnailUrl && media.platform === "YOUTUBE" && media.externalId) {
      thumbnailUrl = `https://img.youtube.com/vi/${media.externalId}/maxresdefault.jpg`;
    }

    // For video content, use embedUrl from API (already resolved by backend)
    // For images, use the direct url
    const url =
      media.mediaType === "VIDEO"
        ? media.embedUrl || media.url || ""
        : media.url || "";

    return {
      id: media.id,
      type: media.mediaType as "IMAGE" | "VIDEO",
      url,
      thumbnailUrl: thumbnailUrl || undefined,
      title: media.title || "Untitled",
      description: media.description || undefined,
      category,
      author: media.author || undefined,
      date: new Date(media.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      }),
    };
  } else {
    // User-uploaded media
    // Determine type based on content type
    const isVideo = media.contentType?.startsWith("video/");
    const type: "IMAGE" | "VIDEO" = isVideo ? "VIDEO" : "IMAGE";

    return {
      id: media.id,
      type,
      url: media.publicUrl || "",
      thumbnailUrl: undefined, // User uploads don't have separate thumbnails
      title: media.title || media.originalName || media.fileName,
      description: media.description || undefined,
      category,
      author: media.uploadedBy || "Community Contributor",
      date: new Date(media.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      }),
      source: "user" as const, // Mark source for potential UI differentiation
    };
  }
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
        // Fetch unified gallery media (includes both user uploads and external content)
        // Gallery API automatically returns only ACTIVE items
        const galleryResponse = await getGalleryMedia({ size: 100 });

        // Separate photos and videos based on media type
        const photoItems: MediaItem[] = [];
        const videoItems: MediaItem[] = [];

        galleryResponse.items.forEach((media) => {
          const mappedItem = mapGalleryMediaToMediaItem(media);

          // Separate by type
          if (mappedItem.type === "IMAGE") {
            photoItems.push(mappedItem);
          } else if (mappedItem.type === "VIDEO") {
            videoItems.push(mappedItem);
          }
        });

        setPhotos(photoItems);
        setVideos(videoItems);
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
    <div className="bg-canvas min-h-screen pb-12">
      {/* Header */}
      <div className="bg-body text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="mb-4 font-serif text-3xl font-bold md:text-5xl">
                Brava Media Center
              </h1>
              <p className="text-mist-300 max-w-2xl text-lg font-light">
                A visual archive of our island. Explore historical photographs,
                community moments, and videos celebrating the culture of Brava.
              </p>
            </div>
            <Link
              href="/contribute/media"
              className="bg-ocean-blue flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-blue-800 active:scale-95"
            >
              <Plus size={18} />
              Add to Archive
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-hairline bg-canvas sticky top-16 z-30 border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("photos")}
              className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "photos"
                  ? "border-ocean-blue text-ocean-blue"
                  : "text-muted hover:border-hairline hover:text-body border-transparent"
              }`}
            >
              <ImageIcon size={18} /> Photo Gallery
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "videos"
                  ? "border-bougainvillea-pink text-bougainvillea-pink"
                  : "text-muted hover:border-hairline hover:text-body border-transparent"
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
