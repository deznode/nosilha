import type { Metadata } from "next";
import { getGalleryMedia, getGalleryCategories } from "@/lib/api";
import { generatePageMetadata, siteConfig } from "@/lib/metadata";
import { mapGalleryMediaToMediaItem } from "@/lib/gallery-mappers";
import { GALLERY_PAGE_SIZE } from "@/hooks/queries/useGalleryInfiniteQuery";
import { GalleryContent } from "./gallery-content";
import type { MediaCategory } from "@/types/media";
import type { BreadcrumbListSchema } from "@/types/metadata";

export const revalidate = 1800; // 30 minutes ISR matching CacheConfig.GALLERY

interface GalleryPageProps {
  searchParams: Promise<{
    tab?: string;
    category?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: GalleryPageProps): Promise<Metadata> {
  const { tab, category } = await searchParams;

  const isVideos = tab === "videos";
  const activeCategory = category || null;

  let title = "Brava Media Center";
  if (isVideos) {
    title = "Videos & Podcasts - Brava Media Center";
  } else if (activeCategory && activeCategory !== "All") {
    title = `${activeCategory} Photos - Brava Media Center`;
  }

  const description = isVideos
    ? "Watch cinematic views of Brava's landscapes and listen to interviews with elders about Cape Verdean heritage and migration stories."
    : "Explore historical photographs, community moments, and cultural heritage images from Brava Island, Cape Verde.";

  const breadcrumbSchema: BreadcrumbListSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Gallery",
        item: `${siteConfig.url}/gallery`,
      },
    ],
  };

  return generatePageMetadata({
    title,
    description,
    path: "/gallery",
    keywords: [
      "Brava Island photos",
      "Cape Verde gallery",
      "cultural heritage images",
      "historical photographs",
      "Brava visual archive",
    ],
    structuredData: [breadcrumbSchema],
    baseUrl: siteConfig.url,
    siteName: siteConfig.name,
    defaultImage: siteConfig.ogImage,
  });
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const { tab, category } = await searchParams;

  const [galleryResponse, apiCategories] = await Promise.all([
    getGalleryMedia({ size: GALLERY_PAGE_SIZE }),
    getGalleryCategories().catch(() => [] as string[]),
  ]);

  const allItems = galleryResponse.items.map(mapGalleryMediaToMediaItem);
  const photos = allItems.filter((item) => item.type === "IMAGE");
  const videos = allItems.filter((item) => item.type === "VIDEO");

  const initialTab: "photos" | "videos" =
    tab === "videos" ? "videos" : "photos";
  const initialCategory: MediaCategory | "All" =
    (category as MediaCategory) || "All";

  return (
    <GalleryContent
      photos={photos}
      videos={videos}
      categories={apiCategories}
      initialTab={initialTab}
      initialCategory={initialCategory}
      pagination={{
        totalItems: galleryResponse.totalItems,
        totalPages: galleryResponse.totalPages,
        currentPage: galleryResponse.currentPage,
      }}
    />
  );
}
