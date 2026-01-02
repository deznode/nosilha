package com.nosilha.core.media.domain

/**
 * Represents the lifecycle state of a media file in the moderation workflow.
 *
 * State Transitions:
 * - PENDING → PROCESSING: After upload is confirmed
 * - PROCESSING → PENDING_REVIEW: After processing completes
 * - PENDING_REVIEW → AVAILABLE: Admin approves
 * - PENDING_REVIEW → FLAGGED: Admin flags for further review
 * - PENDING_REVIEW → DELETED: Admin rejects
 * - FLAGGED → AVAILABLE: Admin approves after review
 * - FLAGGED → DELETED: Admin rejects after review
 * - AVAILABLE → DELETED: Soft delete by owner or admin
 * - DELETED → AVAILABLE: Admin restore
 */
enum class MediaStatus {
    /** Initial state after presign URL requested, upload not confirmed. */
    PENDING,

    /** Upload confirmed, any async processing in progress. */
    PROCESSING,

    /** Processing complete, awaiting admin approval. */
    PENDING_REVIEW,

    /** Flagged for review due to content concerns or quality issues. */
    FLAGGED,

    /** Approved and publicly visible. */
    AVAILABLE,

    /** Soft deleted, hidden from public but recoverable. */
    DELETED,
}
