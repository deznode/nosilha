/**
 * Gallery media mapping utilities.
 *
 * Pure functions for converting API gallery media into frontend MediaItem types.
 * Shared between the server component (initial data) and the client-side
 * useGalleryInfiniteQuery hook (subsequent pages).
 */

import type { PublicGalleryMedia } from "@/types/gallery";
import {
  isPublicUserUploadMedia,
  isPublicExternalMedia,
} from "@/types/gallery";
import type { MediaItem, MediaCategory } from "@/types/media";
import type { GeoPointFeature } from "@/features/map/shared";

const NON_IMAGE_URL_PATTERNS = [
  "youtube.com/watch",
  "youtube.com/embed",
  "youtu.be/",
  "vimeo.com/",
  "soundcloud.com/",
];

/**
 * Resolves a thumbnail URL for external media, handling bad data where
 * a video page URL (e.g. YouTube watch URL) was stored instead of an
 * actual image URL. Falls back to YouTube's thumbnail API when possible.
 */
export function resolveExternalThumbnail(
  thumbnailUrl: string | null | undefined,
  platform: string | null | undefined,
  externalId: string | null | undefined
): string | null {
  if (
    thumbnailUrl &&
    !NON_IMAGE_URL_PATTERNS.some((p) => thumbnailUrl.toLowerCase().includes(p))
  ) {
    return thumbnailUrl;
  }

  if (platform === "YOUTUBE" && externalId) {
    return `https://img.youtube.com/vi/${externalId}/hqdefault.jpg`;
  }

  return null;
}

/**
 * Resolves the best available image URL for any PublicGalleryMedia item.
 *
 * Handles all media source + type combinations:
 * - USER_UPLOAD → publicUrl
 * - EXTERNAL IMAGE → url or thumbnailUrl
 * - EXTERNAL VIDEO/AUDIO → resolved thumbnail (never the embed/watch URL)
 */
export function resolvePublicImageUrl(
  media: PublicGalleryMedia
): string | null {
  if (isPublicUserUploadMedia(media)) {
    return media.publicUrl ?? null;
  }
  if (isPublicExternalMedia(media)) {
    if (media.mediaType === "IMAGE") {
      return media.url || media.thumbnailUrl || null;
    }
    return resolveExternalThumbnail(
      media.thumbnailUrl,
      media.platform,
      media.externalId
    );
  }
  return null;
}

const CATEGORY_MAP: Record<string, MediaCategory> = {
  Heritage: "Heritage",
  Landmark: "Heritage",
  Historical: "Heritage",
  Landscape: "Landscape",
  Nature: "Nature",
  Culture: "Culture",
  People: "People",
  Event: "Event",
  Interview: "Interview",
};

const RAW_FILENAME_PATTERNS = [
  /^[0-9a-f]{8}-[0-9a-f]{4}-/i,
  /^(DJI|IMG|DSC|DCIM|DSCN|P)_/i,
  /\.(jpe?g|png|webp|heic|mp4|mov)$/i,
];

export function isRawFilename(title: string): boolean {
  if (!title || title.trim() === "") return true;
  return RAW_FILENAME_PATTERNS.some((pattern) => pattern.test(title));
}

function humanizeTitle(
  category: MediaCategory | undefined,
  createdAt: string
): string {
  const date = new Date(createdAt);
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();
  const prefix = category ?? "Brava Island";
  return `${prefix} — ${month} ${year}`;
}

export function mapGalleryMediaToMediaItem(
  media: PublicGalleryMedia
): MediaItem {
  const category = CATEGORY_MAP[media.category || ""] || undefined;
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
    const thumbnailUrl = resolveExternalThumbnail(
      media.thumbnailUrl,
      media.platform,
      media.externalId
    );

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

/** Properties attached to each gallery GeoJSON point feature. */
export interface GalleryGeoProperties {
  cluster: false;
  mediaId: string;
  category: string;
  title: string;
  thumbnailUrl: string | null;
}

/**
 * Converts a MediaItem with GPS coordinates to a GeoJSON point feature.
 * Returns `null` when lat/lng are missing — callers should filter nulls.
 */
export function mediaItemToGeoFeature(
  item: MediaItem
): GeoPointFeature<GalleryGeoProperties> | null {
  if (item.latitude == null || item.longitude == null) return null;

  return {
    type: "Feature",
    properties: {
      cluster: false,
      mediaId: item.id,
      category: item.category || "",
      title: item.title,
      thumbnailUrl: item.thumbnailUrl ?? item.url,
    },
    geometry: {
      type: "Point",
      coordinates: [item.longitude, item.latitude],
    },
  };
}
