/**
 * Media Gallery Types
 *
 * Types for photos, videos, and media content in the gallery.
 */

import { SubmissionStatus } from "./story";

export type MediaType = "IMAGE" | "VIDEO";

export type MediaCategory =
  | "Heritage"
  | "Historical"
  | "Nature"
  | "Culture"
  | "Event"
  | "Interview";

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  category: MediaCategory;
  date?: string;
  author?: string;
  authorId?: string;
  locationId?: string;
  locationName?: string;
  status?: SubmissionStatus;
  /** Source of media: 'curated' for admin-curated content, 'user' for user uploads */
  source?: "curated" | "user";
}

export interface PhotoUploadData {
  title: string;
  description?: string;
  category: MediaCategory;
  locationId?: string;
  yearTaken?: number;
  file: File;
  consent: boolean;
}

export interface GalleryFilters {
  category?: MediaCategory | "All";
  type?: MediaType | "All";
  searchQuery?: string;
}

// ============================================================================
// EXIF Metadata Types
// ============================================================================

/**
 * Photo type determines GPS privacy handling:
 * - CULTURAL_SITE: Full GPS precision (6 decimals) for documented landmarks
 * - COMMUNITY_EVENT: Rounded GPS (~100m, 3 decimals) for gatherings
 * - PERSONAL: GPS stripped entirely for private photos
 */
export type PhotoType = "CULTURAL_SITE" | "COMMUNITY_EVENT" | "PERSONAL";

/**
 * GPS privacy level applied to photo coordinates:
 * - FULL: Original precision preserved
 * - APPROXIMATE: Rounded to ~100m accuracy
 * - STRIPPED: GPS data removed
 * - NONE: No GPS data was available in original
 */
export type GpsPrivacyLevel = "FULL" | "APPROXIMATE" | "STRIPPED" | "NONE";

/**
 * Extracted EXIF metadata from photo files.
 * All fields are optional as not all photos contain metadata.
 */
export interface ExtractedExifData {
  // GPS coordinates
  latitude?: number;
  longitude?: number;
  altitude?: number;

  // Date/time
  dateTimeOriginal?: Date;

  // Camera info
  make?: string;
  model?: string;

  // Image properties
  orientation?: number;
  width?: number;
  height?: number;
}

/**
 * Manual metadata for historical photos without EXIF data.
 */
export interface ManualMetadata {
  approximateDate?: string;
  locationName?: string;
  photographerCredit?: string;
  archiveSource?: string;
}

/**
 * Complete photo metadata combining extracted EXIF and manual entry.
 */
export interface PhotoMetadata extends ExtractedExifData, ManualMetadata {
  // Privacy settings
  photoType: PhotoType;
  gpsPrivacyLevel: GpsPrivacyLevel;

  // Status flags
  hasExifData: boolean;
}

/**
 * Metadata fields for the upload confirm request.
 * Dates are serialized as ISO 8601 strings.
 */
export interface ConfirmRequestMetadata {
  // EXIF metadata (privacy-processed)
  latitude?: number;
  longitude?: number;
  altitude?: number;
  dateTaken?: string; // ISO 8601
  cameraMake?: string;
  cameraModel?: string;
  orientation?: number;

  // Privacy tracking
  photoType?: PhotoType;
  gpsPrivacyLevel?: GpsPrivacyLevel;

  // Manual metadata
  approximateDate?: string;
  locationName?: string;
  photographerCredit?: string;
  archiveSource?: string;
}
