/**
 * Curated Media Types
 *
 * Types for the CuratedMedia API which manages curated external content
 * (YouTube videos, external photos, etc.) for the gallery page.
 *
 * This is separate from the Media entity which handles user-uploaded files to R2.
 */

export type MediaType = "IMAGE" | "VIDEO" | "AUDIO";

export type ExternalPlatform =
  | "YOUTUBE"
  | "VIMEO"
  | "SOUNDCLOUD"
  | "SELF_HOSTED";

export type CuratedMediaStatus = "ACTIVE" | "ARCHIVED";

/**
 * Curated media item from the backend API
 */
export interface CuratedMedia {
  id: string;
  mediaType: MediaType;
  platform: ExternalPlatform;
  externalId: string | null;
  url: string | null;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  title: string;
  description: string | null;
  author: string | null;
  category: string;
  displayOrder: number;
  createdAt: string;
}

/**
 * Paginated response for curated media queries
 */
export interface CuratedMediaPageResponse {
  items: CuratedMedia[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Query parameters for curated media API calls
 */
export interface CuratedMediaQueryParams {
  mediaType?: MediaType;
  category?: string;
  page?: number;
  size?: number;
}
