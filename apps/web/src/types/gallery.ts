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
  "YOUTUBE" | "VIMEO" | "SOUNDCLOUD" | "SELF_HOSTED";

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
  showInGallery: boolean;
  altText: string | null;
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
  uploaderDisplayName?: string;
  photographerCredit?: string;
  creditPlatform?: string;
  creditHandle?: string;
  aiTitle?: string;
  aiTags?: string[];
  aiAltText?: string;
  aiDescription?: string;
  aiProcessedAt?: string;
  // EXIF fields (returned by backend GalleryMediaDto.UserUpload)
  latitude?: number;
  longitude?: number;
  altitude?: number;
  dateTaken?: string;
  cameraMake?: string;
  cameraModel?: string;
  orientation?: number;
  photoType?: string;
  gpsPrivacyLevel?: string;
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
  curatorDisplayName?: string;
  creditPlatform?: string;
  creditHandle?: string;
  durationSeconds?: number;
  featured?: boolean;
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

// ========================================
// PUBLIC API TYPES (GET /api/v1/gallery/**)
// ========================================

/**
 * Base interface for public gallery media items.
 * Excludes: status (always ACTIVE), AI fields, storage internals, internal UUIDs.
 */
export interface PublicGalleryMediaBase {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  displayOrder: number;
  mediaSource: GalleryMediaSource;
  altText: string | null;
  createdAt: string;
  /**
   * Shows an identifiable person whose provenance nobody has confirmed. Such a record
   * is listed where it can be identified and kept out of every promotional slot.
   * Spec 034 FR-022.
   */
  identifiablePerson?: boolean;
}

/**
 * Public view of user-uploaded media.
 * Excludes storage internals, AI fields, and internal UUIDs.
 */
export interface PublicUserUploadMedia extends PublicGalleryMediaBase {
  mediaSource: "USER_UPLOAD";
  publicUrl: string | null;
  /**
   * The name the file arrived under. Since spec 034 FR-019 the upload no longer
   * copies this into `title`, so an untitled record shows "Untitled" and this.
   */
  originalName?: string;
  /** Pixel dimensions, recorded at upload; absent for rows that predate the backfill. */
  width?: number | null;
  height?: number | null;
  entryId?: string;
  uploaderDisplayName?: string;
  latitude?: number;
  longitude?: number;
  dateTaken?: string;
  cameraMake?: string;
  cameraModel?: string;
  approximateDate?: string;
  locationName?: string;
  photographerCredit?: string;
  archiveSource?: string;
  creditPlatform?: string;
  creditHandle?: string;
}

/**
 * Public view of external media.
 * Excludes curatedBy UUID (keeps curatorDisplayName for attribution).
 */
export interface PublicExternalMedia extends PublicGalleryMediaBase {
  mediaSource: "EXTERNAL";
  mediaType: MediaType;
  platform: ExternalPlatform;
  externalId: string | null;
  url: string | null;
  thumbnailUrl: string | null;
  embedUrl: string | null;
  author: string | null;
  curatorDisplayName?: string;
  creditPlatform?: string;
  creditHandle?: string;
  durationSeconds?: number;
  featured?: boolean;
}

/** Discriminated union for public gallery media */
export type PublicGalleryMedia = PublicUserUploadMedia | PublicExternalMedia;

/** Type guard for public user upload media */
export function isPublicUserUploadMedia(
  media: PublicGalleryMedia
): media is PublicUserUploadMedia {
  return media.mediaSource === "USER_UPLOAD";
}

/** Type guard for public external media */
export function isPublicExternalMedia(
  media: PublicGalleryMedia
): media is PublicExternalMedia {
  return media.mediaSource === "EXTERNAL";
}

/** Paginated response for public gallery queries */
export interface PublicGalleryMediaPageResponse {
  items: PublicGalleryMedia[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

/**
 * A single decade group in the timeline aggregation.
 */
export interface DecadeGroup {
  decade: string;
  label: string;
  count: number;
  samplePhotos: PublicGalleryMedia[];
}

/**
 * Response for the gallery timeline aggregation endpoint.
 */
export interface TimelineResponse {
  groups: DecadeGroup[];
  totalCount: number;
}

/**
 * Whole-archive counts for chips, standfirsts and home copy.
 *
 * Matches `GalleryFacetsDto` from `GET /api/v1/gallery/facets`. Every count on
 * `/photographs`, the home page and the map reads from here or from a list total,
 * never from a loaded page. Spec 034 FR-018.
 */
export interface GalleryFacets {
  total: number;
  photographs: number;
  films: number;
  withPlace: number;
  withoutPlace: number;
  withoutDate: number;
  uncredited: number;
}

/**
 * Where a located photograph sits among all located archive photographs.
 *
 * Matches `PhotoSequenceDto` from `GET /api/v1/gallery/{id}/sequence`. A record with
 * no coordinates has a null `position` and no neighbours. Neighbours wrap at the
 * ends. Spec 034 FR-021.
 */
export interface PhotoSequence {
  id: string;
  position: number | null;
  total: number;
  previousId: string | null;
  nextId: string | null;
}

/**
 * Query parameters for the public gallery list. Spec 034 T-12.
 *
 * `nearLat` and `nearLng` are a pair — sending one without the other is a 400.
 */
export interface GalleryQueryParams {
  category?: string;
  decade?: string;
  q?: string;
  hasGeo?: boolean;
  /** true = located (has coordinates), false = unlocated. */
  hasPlace?: boolean;
  /** false = neither a date taken nor an approximate date. */
  hasDate?: boolean;
  /**
   * Photographs or films. Narrower than {@link MediaType} on purpose: the API
   * rejects `AUDIO` with a 400, so the invalid call is not expressible here.
   */
  mediaType?: Extract<MediaType, "IMAGE" | "VIDEO">;
  nearLat?: number;
  nearLng?: number;
  /** Only records attached to no entry — the unconfirmed tray. */
  unplaced?: boolean;
  page?: number;
  size?: number;
}

/**
 * Gallery filter types shared between server and client components.
 */
export type DecadeFilter =
  "all" | "pre-1975" | "1975-1990" | "1990-2010" | "2010-plus";

export type GalleryView = "grid" | "timeline" | "map";

/**
 * Query parameters for gallery API calls
 */
export interface GalleryMediaQueryParams {
  category?: string;
  decade?: string;
  q?: string;
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
 * Request to update EXIF metadata on user-uploaded gallery media (admin only).
 * PATCH semantics — only provided fields are updated.
 */
export interface UpdateExifRequest {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  dateTaken?: string; // ISO 8601
  cameraMake?: string;
  cameraModel?: string;
  orientation?: number;
  photoType?: string;
  gpsPrivacyLevel?: string;
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

/**
 * Request to update gallery media metadata (admin only)
 * PATCH semantics — only provided fields are updated
 */
export interface UpdateGalleryMediaRequest {
  title?: string;
  description?: string;
  category?: string;
  author?: string;
  photographerCredit?: string;
  showInGallery?: boolean;
  featured?: boolean;
  durationSeconds?: number;
}
