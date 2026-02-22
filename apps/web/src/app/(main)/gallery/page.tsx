import type { Metadata } from "next";
import { getGalleryMedia, getGalleryCategories } from "@/lib/api";
import { generatePageMetadata, siteConfig } from "@/lib/metadata";
import { mapGalleryMediaToMediaItem } from "@/lib/gallery-mappers";
import { GALLERY_PAGE_SIZE } from "@/hooks/queries/useGalleryInfiniteQuery";
import { GalleryContent } from "./gallery-content";
import type { MediaCategory } from "@/types/media";
import type {
  BreadcrumbListSchema,
  ImageGallerySchema,
  ImageObjectSchema,
} from "@/types/metadata";
import type { PublicGalleryMedia } from "@/types/gallery";

export const revalidate = 1800; // 30 minutes ISR matching CacheConfig.GALLERY

type DecadeFilter = "all" | "pre-1975" | "1975-1990" | "1990-2010" | "2010-plus";

const VALID_DECADES = new Set<string>([
  "pre-1975",
  "1975-1990",
  "1990-2010",
  "2010-plus",
]);

interface GalleryPageProps {
  searchParams: Promise<{
    tab?: string;
    category?: string;
    decade?: string;
    q?: string;
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

  const imageGallerySchema: ImageGallerySchema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "Brava Media Center",
    description:
      "A visual archive of Brava Island, Cape Verde. Historical photographs, community moments, and videos celebrating the culture of Brava.",
    url: `${siteConfig.url}/gallery`,
  };

  const metadata = generatePageMetadata({
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
    structuredData: [breadcrumbSchema, imageGallerySchema],
    baseUrl: siteConfig.url,
    siteName: siteConfig.name,
    defaultImage: siteConfig.ogImage,
  });

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      locale: "pt_CV",
      alternateLocale: ["en_US"],
    },
  };
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const { tab, category, decade, q } = await searchParams;

  const initialDecade: DecadeFilter =
    decade && VALID_DECADES.has(decade) ? (decade as DecadeFilter) : "all";
  const initialQuery = q?.trim() || "";

  const [galleryResponse, apiCategories] = await Promise.all([
    getGalleryMedia({
      size: GALLERY_PAGE_SIZE,
      decade: initialDecade !== "all" ? initialDecade : undefined,
      q: initialQuery || undefined,
    }),
    getGalleryCategories().catch(() => [] as string[]),
  ]);

  const allItems = galleryResponse.items.map(mapGalleryMediaToMediaItem);
  const photos = allItems.filter((item) => item.type === "IMAGE");
  const videos = allItems.filter((item) => item.type === "VIDEO");

  const initialTab: "photos" | "videos" =
    tab === "videos" ? "videos" : "photos";
  const initialCategory: MediaCategory | "All" =
    (category as MediaCategory) || "All";

  // Build ImageGallery JSON-LD with first page of items
  const galleryJsonLd: ImageGallerySchema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "Brava Media Center",
    description:
      "A visual archive of Brava Island, Cape Verde. Historical photographs, community moments, and videos celebrating the culture of Brava.",
    url: `${siteConfig.url}/gallery`,
    numberOfItems: galleryResponse.totalItems,
    image: galleryResponse.items
      .filter(
        (item): item is PublicGalleryMedia & { mediaSource: "USER_UPLOAD" } =>
          item.mediaSource === "USER_UPLOAD" &&
          !!(item as { publicUrl?: string | null }).publicUrl,
      )
      .slice(0, 10)
      .map((item) => buildListingImageObject(item)),
  };

  return (
    <>
      {/* Safe: JSON.stringify escapes all content; data is server-fetched from DB */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(galleryJsonLd) }}
      />
      <GalleryContent
      photos={photos}
      videos={videos}
      categories={apiCategories}
      initialTab={initialTab}
      initialCategory={initialCategory}
      initialDecade={initialDecade}
      initialQuery={initialQuery}
      pagination={{
        totalItems: galleryResponse.totalItems,
        totalPages: galleryResponse.totalPages,
        currentPage: galleryResponse.currentPage,
      }}
    />
    </>
  );
}

function buildListingImageObject(
  item: PublicGalleryMedia & { mediaSource: "USER_UPLOAD" },
): ImageObjectSchema {
  const upload = item as import("@/types/gallery").PublicUserUploadMedia;
  const schema: ImageObjectSchema = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: upload.title || "Brava Island Photo",
    contentUrl: upload.publicUrl!,
    license: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  };

  if (upload.description) schema.description = upload.description;
  if (upload.altText) schema.accessibilityFeature = ["alternativeText"];

  const credit = upload.photographerCredit || upload.uploaderDisplayName;
  if (credit) {
    schema.author = { "@type": "Person", name: credit };
    schema.creditText = credit;
  }

  if (upload.dateTaken) {
    schema.dateCreated = upload.dateTaken;
  } else if (upload.approximateDate) {
    schema.dateCreated = upload.approximateDate;
  }

  if (upload.locationName) {
    schema.locationCreated = {
      "@type": "Place",
      name: upload.locationName,
      containedInPlace: { "@type": "Place", name: "Brava Island, Cape Verde" },
    };
  }

  return schema;
}
