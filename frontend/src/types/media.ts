/**
 * Media Gallery Types
 *
 * Types for photos, videos, and media content in the gallery.
 */

import { SubmissionStatus } from "./story";

export type MediaType = "IMAGE" | "VIDEO";

export type MediaCategory =
  | "Landmark"
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
