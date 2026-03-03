/**
 * Unified Gallery Types
 *
 * Types for the Gallery API which manages both user-uploaded media
 * and admin-curated external content in a unified interface.
 *
 * This consolidates the previous Media and CuratedMedia types into
 * a single, type-safe discriminated union.
 */

export type GalleryMediaSource = "USER_UPLOAD" | "EXTERNAL";

export type GalleryMediaStatus =
  | "PENDING_REVIEW"
  | "PROCESSING"
  | "ACTIVE"
  | "FLAGGED"
  | "REJECTED"
  | "ARCHIVED";

export type MediaType = "IMAGE" | "VIDEO" | "AUDIO";

export type ExternalPlatform =
  | "YOUTUBE"
  | "VIMEO"
  | "SOUNDCLOUD"
  | "SELF_HOSTED";

export type MediaSource = "LOCAL" | "GOOGLE_PHOTOS" | "ADOBE_LIGHTROOM";

/**
 * Base interface for all gallery media items
 */
export interface GalleryMediaBase {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  displayOrder: number;
  status: GalleryMediaStatus;
  mediaSource: GalleryMediaSource;
  createdAt: string;
}

/**
 * User-uploaded media (stored in Cloudflare R2)
 */
export interface UserUploadMedia extends GalleryMediaBase {
  mediaSource: "USER_UPLOAD";
  fileName: string;
  originalName: string;
  storageKey: string;
  publicUrl: string | null;
  contentType: string;
  fileSize: number;
  entryId?: string;
  source?: MediaSource;
  uploadedBy?: string;
}

/**
 * Admin-curated external media (YouTube, Vimeo, etc.)
 */
export interface ExternalMedia extends GalleryMediaBase {
  mediaSource: "EXTERNAL";
  mediaType: MediaType;
  platform: ExternalPlatform;
  externalId: string | null;
  url: string | null;
  thumbnailUrl: string | null;
  embedUrl: string | null;
  author: string | null;
  curatedBy?: string;
}

/**
 * Discriminated union type for all gallery media
 * Use this for type-safe handling of mixed media sources
 */
export type GalleryMedia = UserUploadMedia | ExternalMedia;

/**
 * Type guard to check if media is user-uploaded
 */
export function isUserUploadMedia(
  media: GalleryMedia
): media is UserUploadMedia {
  return media.mediaSource === "USER_UPLOAD";
}

/**
 * Type guard to check if media is external
 */
export function isExternalMedia(media: GalleryMedia): media is ExternalMedia {
  return media.mediaSource === "EXTERNAL";
}

/**
 * Paginated response for gallery queries
 */
export interface GalleryMediaPageResponse {
  items: GalleryMedia[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Query parameters for gallery API calls
 */
export interface GalleryMediaQueryParams {
  category?: string;
  page?: number;
  size?: number;
}

/**
 * Request to submit external media for review
 */
export interface SubmitExternalMediaRequest {
  title: string;
  description?: string;
  mediaType: MediaType;
  platform: ExternalPlatform;
  url: string;
  externalId?: string;
  thumbnailUrl?: string;
  author?: string;
  category?: string;
}

/**
 * Request to create external media directly (admin only)
 */
export interface CreateExternalMediaRequest {
  title: string;
  description?: string;
  mediaType: MediaType;
  platform: ExternalPlatform;
  url: string;
  externalId?: string;
  thumbnailUrl?: string;
  author?: string;
  category?: string;
  displayOrder?: number;
}

/**
 * Moderation action types for gallery media
 */
export type GalleryModerationAction = "APPROVE" | "FLAG" | "REJECT";

/**
 * Request to update gallery media status (admin only)
 */
export interface UpdateGalleryStatusRequest {
  action: GalleryModerationAction;
  reason?: string; // Required for FLAG
  adminNotes?: string;
}
