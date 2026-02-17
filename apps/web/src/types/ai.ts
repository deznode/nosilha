/**
 * AI Types
 *
 * Mirrors backend DTOs from AiModerationDtos.kt and TextAiDtos.kt.
 * Used by the admin AI review queue UI and text AI operations.
 */

// ================================
// TEXT AI TYPES (mirrors TextAiDtos.kt)
// ================================

export interface PolishContentRequest {
  content: string;
}

export interface PolishContentResponse {
  content: string;
  aiApplied: boolean;
}

export interface TranslateContentRequest {
  content: string;
  targetLang: string;
}

export interface TranslateContentResponse {
  content: string;
  aiApplied: boolean;
}

export interface GeneratePromptsRequest {
  templateType: string;
  existingContent?: string;
}

export interface GeneratePromptsResponse {
  prompts: string[];
}

export interface GenerateDirectoryContentRequest {
  name: string;
  category: string;
}

export interface DirectoryContentResponse {
  description: string;
  tags: string[];
}

export interface AiAvailableResponse {
  available: boolean;
}

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

// ================================
// TRIGGER TYPES
// ================================

/**
 * Response from triggering AI analysis on a single media item.
 * Mirrors AnalysisTriggerResponse.
 */
export interface AnalysisTriggerResponse {
  mediaId: string;
  analysisRunId: string;
  status: string;
}

/**
 * Request body for batch AI analysis trigger.
 * Mirrors AnalyzeBatchRequest.
 */
export interface AnalyzeBatchRequest {
  mediaIds: string[];
}

/**
 * Response from batch AI analysis trigger.
 * Mirrors BatchAnalysisTriggerResponse.
 */
export interface BatchAnalysisTriggerResponse {
  batchId: string | null;
  accepted: number;
  rejected: number;
  errors: BatchErrorDto[];
}

/**
 * Error detail for a single item in a batch trigger.
 * Mirrors BatchErrorDto.
 */
export interface BatchErrorDto {
  mediaId: string;
  reason: string;
}
