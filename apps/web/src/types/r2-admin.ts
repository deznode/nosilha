/**
 * R2 Admin Types
 *
 * TypeScript interfaces matching backend R2AdminDtos.kt.
 * Used by the R2 storage management panel in the admin dashboard.
 */

// --- Bucket Listing ---

export interface R2ObjectDto {
  key: string;
  size: number;
  lastModified: string;
  publicUrl: string;
}

export interface R2BucketListResponse {
  objects: R2ObjectDto[];
  continuationToken: string | null;
  isTruncated: boolean;
}

// --- Bulk Presign ---

export interface BulkPresignFileRequest {
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface BulkPresignRequest {
  files: BulkPresignFileRequest[];
}

export interface BulkPresignItemResponse {
  fileName: string;
  uploadUrl: string;
  key: string;
  expiresAt: string;
}

export interface BulkPresignResponse {
  presigns: BulkPresignItemResponse[];
}

// --- Bulk Confirm ---

export interface BulkConfirmUploadDto {
  key: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  category?: string;
  description?: string;
}

export interface BulkConfirmRequest {
  uploads: BulkConfirmUploadDto[];
}

export interface BulkConfirmResponse {
  accepted: number;
  rejected: number;
  created: string[];
  errors: BatchUploadError[];
}

export interface BatchUploadError {
  key: string;
  reason: string;
}

// --- Orphan Detection ---

export interface OrphanObjectDto {
  key: string;
  size: number;
  lastModified: string;
  publicUrl: string;
}

export interface OrphanDetectionResponse {
  orphans: OrphanObjectDto[];
  totalScanned: number;
  continuationToken: string | null;
  isTruncated: boolean;
}

// --- Orphan Linking ---

export interface LinkOrphanRequest {
  storageKey: string;
  category?: string;
  description?: string;
}

// --- Orphan Deletion ---

export interface DeleteOrphanRequest {
  storageKey: string;
}
