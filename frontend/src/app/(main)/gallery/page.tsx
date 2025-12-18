"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Play } from "lucide-react";
import {
  PhotoGrid,
  PhotoGridSkeleton,
  VideoSection,
  Lightbox,
} from "@/components/gallery";
import { mockMediaApi } from "@/lib/mocks";
import type { MediaItem, MediaCategory } from "@/types/media";

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
        const [photosData, videosData] = await Promise.all([
          mockMediaApi.getPhotos(),
          mockMediaApi.getVideos(),
        ]);
        setPhotos(photosData);
        setVideos(videosData);
      } catch (error) {
        console.error("Failed to load media:", error);
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
