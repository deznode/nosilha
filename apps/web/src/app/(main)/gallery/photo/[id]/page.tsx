import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Camera,
  MapPin,
  User,
  Archive,
} from "lucide-react";
import { notFound } from "next/navigation";
import { getGalleryMediaById } from "@/lib/api";
import { generatePageMetadata, siteConfig } from "@/lib/metadata";
import { ShareButton } from "@/components/ui/actions/share-button";
import { CreditDisplay } from "@/components/ui/credit-display";
import { IdentifyPhotoButton } from "@/components/gallery/identify-photo-button";
import { isRawFilename } from "@/lib/gallery-mappers";
import type {
  PublicGalleryMedia,
  PublicUserUploadMedia,
} from "@/types/gallery";
import { isPublicUserUploadMedia } from "@/types/gallery";
import type { BreadcrumbListSchema, ImageObjectSchema } from "@/types/metadata";

export const revalidate = 1800;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface PhotoDetailPageProps {
  params: Promise<{ id: string }>;
}

function getPhotoUrl(media: PublicGalleryMedia): string | null {
  if (media.mediaSource === "USER_UPLOAD") {
    return media.publicUrl || null;
  }
  return media.url || media.thumbnailUrl || null;
}

function getPhotoTitle(media: PublicGalleryMedia): string {
  return media.title || "Untitled Photo";
}

function getPhotoDescription(media: PublicGalleryMedia): string {
  return (
    media.description ||
    `A photo from the Brava Island visual archive${media.category ? ` in the ${media.category} category` : ""}.`
  );
}

export async function generateMetadata({
  params,
}: PhotoDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return { title: "Photo Not Found" };
  }

  const media = await getGalleryMediaById(id);
  if (!media) {
    return { title: "Photo Not Found" };
  }

  const title = getPhotoTitle(media);
  const description = getPhotoDescription(media);
  const imageUrl = getPhotoUrl(media);

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
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${siteConfig.url}/gallery/photo/${id}`,
      },
    ],
  };

  // Build ImageObject JSON-LD
  const imageObjectSchema: ImageObjectSchema | null = imageUrl
    ? buildImageObjectSchema(media, imageUrl, title)
    : null;

  const structuredData = [
    breadcrumbSchema,
    ...(imageObjectSchema ? [imageObjectSchema] : []),
  ];

  const metadata = generatePageMetadata({
    title: `${title} - Brava Media Center`,
    description,
    path: `/gallery/photo/${id}`,
    keywords: [
      "Brava Island photo",
      "Cape Verde heritage",
      media.category || "culture",
    ],
    images: imageUrl
      ? [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
            type: "image/jpeg",
          },
        ]
      : [],
    structuredData,
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

function buildImageObjectSchema(
  media: PublicGalleryMedia,
  contentUrl: string,
  title: string
): ImageObjectSchema {
  const schema: ImageObjectSchema = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: title,
    contentUrl,
    thumbnailUrl:
      media.mediaSource === "EXTERNAL" && media.thumbnailUrl
        ? media.thumbnailUrl
        : contentUrl,
    license: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    acquireLicensePage: `${siteConfig.url}/gallery/photo/${media.id}`,
  };

  if (media.description) {
    schema.description = media.description;
  }

  if (media.altText) {
    schema.accessibilityFeature = ["alternativeText"];
  }

  // Author / credit
  if (media.mediaSource === "USER_UPLOAD") {
    const credit = media.photographerCredit || media.uploaderDisplayName;
    if (credit) {
      schema.author = { "@type": "Person", name: credit };
      schema.creditText = credit;
    }

    // Date
    if (media.dateTaken) {
      schema.dateCreated = media.dateTaken;
    } else if (media.approximateDate) {
      schema.dateCreated = media.approximateDate;
    }

    // Location
    const locName = media.locationName;
    if (locName) {
      schema.locationCreated = {
        "@type": "Place",
        name: locName,
        containedInPlace: {
          "@type": "Place",
          name: "Brava Island, Cape Verde",
        },
      };
    } else {
      schema.locationCreated = {
        "@type": "Place",
        name: "Brava Island, Cape Verde",
      };
    }
  } else {
    if (media.author) {
      schema.author = { "@type": "Person", name: media.author };
      schema.creditText = media.author;
    }
    schema.locationCreated = {
      "@type": "Place",
      name: "Brava Island, Cape Verde",
    };
  }

  if (media.createdAt) {
    schema.dateCreated = schema.dateCreated || media.createdAt;
  }

  return schema;
}

export default async function PhotoDetailPage({
  params,
}: PhotoDetailPageProps) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    notFound();
  }

  const media = await getGalleryMediaById(id);
  if (!media) {
    notFound();
  }

  const imageUrl = getPhotoUrl(media);
  const title = getPhotoTitle(media);
  const description = media.description || null;
  const shareUrl = `${siteConfig.url}/gallery/photo/${id}`;

  // Build JSON-LD for page body
  const imageObjectJsonLd = imageUrl
    ? buildImageObjectSchema(media, imageUrl, title)
    : null;

  // Extract user-upload metadata (null for external media)
  const upload: PublicUserUploadMedia | null = isPublicUserUploadMedia(media)
    ? media
    : null;

  const author =
    upload?.photographerCredit ||
    upload?.uploaderDisplayName ||
    (!upload && media.mediaSource === "EXTERNAL" ? media.author : null);

  const dateDisplay = upload?.dateTaken
    ? new Date(upload.dateTaken).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : upload?.approximateDate || null;

  const needsIdentification =
    isRawFilename(media.title || "") ||
    !upload?.locationName ||
    (!upload?.dateTaken && !upload?.approximateDate);

  return (
    <div className="bg-canvas min-h-screen">
      {/* Schema.org ImageObject JSON-LD — safe: content is server-generated from DB fields */}
      {imageObjectJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(imageObjectJsonLd),
          }}
        />
      )}

      {/* Navigation */}
      <div className="bg-basalt-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/gallery"
            className="text-muted flex items-center gap-2 text-sm transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Gallery
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Photo */}
          <div className="lg:col-span-2">
            {imageUrl ? (
              <div className="bg-surface rounded-card shadow-subtle relative overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={media.altText || title}
                  width={1200}
                  height={800}
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>
            ) : (
              <div className="bg-surface-alt rounded-card flex aspect-video items-center justify-center">
                <span className="text-muted">Image not available</span>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Title & Description */}
            <div>
              {media.category && (
                <span className="text-ocean-blue text-xs font-bold tracking-wider uppercase">
                  {media.category}
                </span>
              )}
              <h1 className="text-body mt-1 font-serif text-2xl font-bold">
                {title}
              </h1>
              {description && (
                <p className="text-muted mt-3 text-sm leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="border-hairline space-y-3 border-t pt-4">
              {author && (
                <div className="flex items-center gap-3 text-sm">
                  <User size={16} className="text-muted shrink-0" />
                  <CreditDisplay
                    credit={author}
                    creditPlatform={media.creditPlatform}
                    creditHandle={media.creditHandle}
                    variant="card"
                  />
                </div>
              )}

              {upload?.locationName && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin size={16} className="text-muted shrink-0" />
                  <span className="text-body">{upload.locationName}</span>
                </div>
              )}

              {dateDisplay && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-muted shrink-0" />
                  <span className="text-body">
                    {dateDisplay}
                    {upload?.approximateDate && !upload.dateTaken && (
                      <span className="text-muted ml-1">(approximate)</span>
                    )}
                  </span>
                </div>
              )}

              {upload?.cameraMake && (
                <div className="flex items-center gap-3 text-sm">
                  <Camera size={16} className="text-muted shrink-0" />
                  <span className="text-body">
                    {upload.cameraMake}
                    {upload.cameraModel ? ` ${upload.cameraModel}` : ""}
                  </span>
                </div>
              )}

              {upload?.archiveSource && (
                <div className="flex items-center gap-3 text-sm">
                  <Archive size={16} className="text-muted shrink-0" />
                  <span className="text-body">{upload.archiveSource}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-hairline flex flex-wrap items-center gap-3 border-t pt-4">
              <ShareButton
                title={title}
                url={shareUrl}
                description={description || undefined}
              />
              {imageUrl && (
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-hairline text-body hover:bg-surface-alt rounded-button inline-flex items-center gap-2 border px-4 py-2 text-sm font-medium transition-colors"
                >
                  View Full Size
                </a>
              )}
              {needsIdentification && (
                <IdentifyPhotoButton
                  mediaId={id}
                  photoTitle={title}
                  pageUrl={shareUrl}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
