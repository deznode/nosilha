import type { Metadata } from "next";
import { getGalleryMedia, getGalleryCategories } from "@/lib/api";
import { generatePageMetadata, siteConfig } from "@/lib/metadata";
import { GalleryContent } from "./gallery-content";
import type { MediaItem, MediaCategory } from "@/types/media";
import type { PublicGalleryMedia } from "@/types/gallery";
import type { BreadcrumbListSchema } from "@/types/metadata";

export const revalidate = 1800; // 30 minutes ISR matching CacheConfig.GALLERY

const CATEGORY_MAP: Record<string, MediaCategory> = {
  Heritage: "Heritage",
  Landmark: "Heritage",
  Historical: "Historical",
  Nature: "Nature",
  Culture: "Culture",
  Event: "Event",
  Interview: "Interview",
};

const RAW_FILENAME_PATTERNS = [
  /^[0-9a-f]{8}-[0-9a-f]{4}-/i,
  /^(DJI|IMG|DSC|DCIM|DSCN|P)_/i,
  /\.(jpe?g|png|webp|heic|mp4|mov)$/i,
];

function isRawFilename(title: string): boolean {
  if (!title || title.trim() === "") return true;
  return RAW_FILENAME_PATTERNS.some((pattern) => pattern.test(title));
}

function humanizeTitle(category: MediaCategory, createdAt: string): string {
  const date = new Date(createdAt);
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();
  return `${category} — ${month} ${year}`;
}

function mapGalleryMediaToMediaItem(media: PublicGalleryMedia): MediaItem {
  const category = CATEGORY_MAP[media.category || ""] || "Culture";
  const date = new Date(media.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });

  const rawTitle = media.title || "";
  const title = isRawFilename(rawTitle)
    ? humanizeTitle(category, media.createdAt)
    : rawTitle || "Untitled";

  const base = {
    id: media.id,
    title,
    description: media.description || undefined,
    category,
    date,
    altText: media.altText || undefined,
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
    locationName: media.locationName,
    dateTaken: media.dateTaken,
    cameraMake: media.cameraMake,
    cameraModel: media.cameraModel,
    approximateDate: media.approximateDate,
    photographerCredit: media.photographerCredit,
    archiveSource: media.archiveSource,
    latitude: media.latitude,
    longitude: media.longitude,
  };
}

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
    getGalleryMedia({ size: 100 }),
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
    />
  );
}
