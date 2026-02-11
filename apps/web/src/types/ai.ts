/**
 * AI Image Analysis & Moderation Types
 *
 * Mirrors backend DTOs from AiModerationDtos.kt.
 * Used by the admin AI review queue UI.
 */

// ================================
// ENUMS
// ================================

export type AnalysisRunStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type AiModerationStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED";

// ================================
// REVIEW QUEUE TYPES
// ================================

/**
 * Summary view of an analysis run for the review queue list.
 * Mirrors AnalysisRunSummaryDto.
 */
export interface AnalysisRunSummary {
  id: string;
  mediaId: string;
  status: AnalysisRunStatus;
  moderationStatus: AiModerationStatus;
  providersUsed: string[];
  resultTags: string[];
  resultAltText: string | null;
  resultDescription: string | null;
  createdAt: string;
  completedAt: string | null;
}

/**
 * Detailed view of an analysis run for moderator review.
 * Mirrors AnalysisRunDetailDto.
 */
export interface AnalysisRunDetail {
  id: string;
  mediaId: string;
  batchId: string | null;
  status: AnalysisRunStatus;
  moderationStatus: AiModerationStatus;
  providersUsed: string[];
  rawResults: string | null;
  resultTags: string[];
  resultLabels: string | null;
  resultAltText: string | null;
  resultDescription: string | null;
  moderatedBy: string | null;
  moderatedAt: string | null;
  moderatorNotes: string | null;
  errorMessage: string | null;
  requestedBy: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

// ================================
// REQUEST TYPES
// ================================

/**
 * Request body for approving AI results with admin edits.
 * Mirrors ApproveEditedRequest.
 */
export interface ApproveEditedRequest {
  altText?: string;
  description?: string;
  tags?: string[];
  notes?: string;
}

/**
 * Request body for rejecting AI results.
 * Mirrors RejectRequest.
 */
export interface RejectRequest {
  notes?: string;
}

// ================================
// STATUS TYPES
// ================================

/**
 * AI processing status for a gallery media item.
 * Mirrors AiStatusResponse.
 */
export interface AiStatusResponse {
  mediaId: string;
  lastRunStatus: string | null;
  moderationStatus: string | null;
  aiProcessed: boolean;
  aiProcessedAt: string | null;
}
