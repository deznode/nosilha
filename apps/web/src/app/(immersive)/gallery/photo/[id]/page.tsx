import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Camera,
  MapPin,
  User,
  Archive,
  X,
} from "lucide-react";
import { notFound } from "next/navigation";
import { getGalleryMediaById } from "@/lib/api";
import { generatePageMetadata, siteConfig } from "@/lib/metadata";
import { ShareButton } from "@/components/ui/actions/share-button";
import { CreditDisplay } from "@/components/ui/credit-display";
import { IdentifyPhotoButton } from "@/components/gallery/identify-photo-button";
import { ExpandableText } from "@/components/ui/expandable-text";
import { isRawFilename, resolvePublicImageUrl } from "@/lib/gallery-mappers";
import { YouTubeFacade } from "@/components/gallery/youtube-facade";
import type {
  PublicGalleryMedia,
  PublicUserUploadMedia,
} from "@/types/gallery";
import { isPublicUserUploadMedia } from "@/types/gallery";
import type { BreadcrumbListSchema, ImageObjectSchema } from "@/types/metadata";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface PhotoDetailPageProps {
  params: Promise<{ id: string }>;
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
  const imageUrl = resolvePublicImageUrl(media);

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

/**
 * JSON-LD script element.
 * Content is safe: server-generated from validated DB fields, not user HTML.
 */
function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function PhotoDetailPage({
  params,
}: PhotoDetailPageProps) {
  "use cache";
  cacheLife("entry");
  const { id } = await params;
  cacheTag(`photo:${id}`);

  if (!UUID_REGEX.test(id)) {
    notFound();
  }

  const media = await getGalleryMediaById(id);
  if (!media) {
    notFound();
  }

  const imageUrl = resolvePublicImageUrl(media);
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
    <div className="bg-basalt-900 min-h-screen text-white">
      {imageObjectJsonLd && <JsonLd data={imageObjectJsonLd} />}

      {/* Top bar */}
      <nav className="flex items-center justify-between bg-black/40 px-4 py-3 backdrop-blur-sm">
        <Link
          href="/gallery"
          className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Gallery
        </Link>
        <Link
          href="/gallery"
          className="focus-ring rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          aria-label="Close"
        >
          <X size={18} />
        </Link>
      </nav>

      {/* Desktop: side-by-side. Mobile: stacked */}
      <div
        className="flex flex-col lg:flex-row"
        style={{ minHeight: "calc(100vh - 52px)" }}
      >
        {/* Image/video area */}
        <div className="flex flex-1 items-center justify-center p-4 lg:p-8">
          {media.mediaSource === "EXTERNAL" && media.mediaType === "VIDEO" ? (
            <div className="w-full max-w-4xl">
              <YouTubeFacade
                video={{
                  id: media.id,
                  type: "VIDEO",
                  url: media.embedUrl || media.url || "",
                  thumbnailUrl: imageUrl || "/images/video-placeholder.jpg",
                  title,
                }}
              />
            </div>
          ) : imageUrl ? (
            <div className="relative h-full w-full max-w-5xl">
              <Image
                src={imageUrl}
                alt={media.altText || title}
                width={1600}
                height={1200}
                sizes="(max-width: 1024px) 100vw, calc(100vw - 320px)"
                className="mx-auto max-h-[calc(100vh-120px)] w-auto rounded object-contain"
                priority
              />
            </div>
          ) : (
            <div className="flex aspect-video w-full max-w-4xl items-center justify-center rounded-lg bg-white/5">
              <span className="text-white/40">Image not available</span>
            </div>
          )}
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden w-80 overflow-y-auto bg-black/40 p-6 backdrop-blur-sm lg:block">
          {media.category && (
            <span className="text-ocean-blue text-xs font-bold tracking-wider uppercase">
              {media.category}
            </span>
          )}
          <h1 className="mt-1 font-serif text-2xl font-bold text-white">
            {title}
          </h1>
          {description && (
            <ExpandableText
              text={description}
              lines={3}
              textClassName="text-sm leading-relaxed text-white/70"
              buttonClassName="text-white/50 hover:text-white/80"
              className="mt-3"
            />
          )}

          {/* Metadata */}
          <div className="mt-6 space-y-3 border-t border-white/20 pt-4">
            {author && (
              <div className="flex items-center gap-3 text-sm">
                <User size={16} className="shrink-0 text-white/50" />
                <CreditDisplay
                  credit={author}
                  creditPlatform={media.creditPlatform}
                  creditHandle={media.creditHandle}
                  variant="lightbox"
                  className="text-white/80"
                />
              </div>
            )}

            {upload?.locationName && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="shrink-0 text-white/50" />
                <span className="text-white/80">{upload.locationName}</span>
              </div>
            )}

            {dateDisplay && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="shrink-0 text-white/50" />
                <span className="text-white/80">
                  {dateDisplay}
                  {upload?.approximateDate && !upload.dateTaken && (
                    <span className="ml-1 text-white/50">(approximate)</span>
                  )}
                </span>
              </div>
            )}

            {upload?.cameraMake && (
              <div className="flex items-center gap-3 text-sm">
                <Camera size={16} className="shrink-0 text-white/50" />
                <span className="text-white/80">
                  {upload.cameraMake}
                  {upload.cameraModel ? ` ${upload.cameraModel}` : ""}
                </span>
              </div>
            )}

            {upload?.archiveSource && (
              <div className="flex items-center gap-3 text-sm">
                <Archive size={16} className="shrink-0 text-white/50" />
                <span className="text-white/80">{upload.archiveSource}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/20 pt-4">
            <ShareButton
              title={title}
              url={shareUrl}
              description={description || undefined}
              variant="icon-only"
            />
            {imageUrl && (
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
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
        </aside>
      </div>

      {/* Mobile: compact metadata below image */}
      <div className="bg-black/40 px-4 py-4 backdrop-blur-sm lg:hidden">
        {media.category && (
          <span className="text-ocean-blue text-xs font-bold tracking-wider uppercase">
            {media.category}
          </span>
        )}
        <h1 className="mt-1 font-serif text-xl font-bold text-white">
          {title}
        </h1>
        {description && (
          <ExpandableText
            text={description}
            lines={3}
            textClassName="text-sm leading-relaxed text-white/70"
            buttonClassName="text-white/50 hover:text-white/80"
            className="mt-2"
          />
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/60">
          {author && (
            <span className="flex items-center gap-1">
              <User size={12} />
              {author}
            </span>
          )}
          {upload?.locationName && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {upload.locationName}
            </span>
          )}
          {dateDisplay && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {dateDisplay}
            </span>
          )}
          {upload?.cameraMake && (
            <span className="flex items-center gap-1">
              <Camera size={12} />
              {upload.cameraMake}
              {upload.cameraModel ? ` ${upload.cameraModel}` : ""}
            </span>
          )}
          {upload?.archiveSource && (
            <span className="flex items-center gap-1">
              <Archive size={12} />
              {upload.archiveSource}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ShareButton
            title={title}
            url={shareUrl}
            description={description || undefined}
            variant="icon-only"
          />
          {imageUrl && (
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
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
  );
}
