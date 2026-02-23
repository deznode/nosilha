/**
 * Gallery media mapping utilities.
 *
 * Pure functions for converting API gallery media into frontend MediaItem types.
 * Shared between the server component (initial data) and the client-side
 * useGalleryInfiniteQuery hook (subsequent pages).
 */

import type { PublicGalleryMedia } from "@/types/gallery";
import type { MediaItem, MediaCategory } from "@/types/media";

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

export function mapGalleryMediaToMediaItem(
  media: PublicGalleryMedia
): MediaItem {
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
