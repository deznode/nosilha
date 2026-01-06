package com.nosilha.core.gallery.domain

/**
 * Unified status enum for all gallery media (user-uploaded and curated external content).
 *
 * Represents the lifecycle state of media items in the moderation and publication workflow.
 *
 * State Transitions:
 * - User Uploads: PENDING → PROCESSING → PENDING_REVIEW → ACTIVE/REJECTED → ARCHIVED
 * - External Media: PENDING_REVIEW → ACTIVE → ARCHIVED
 *
 * Status Descriptions:
 * - PENDING_REVIEW: Awaiting moderation (new submissions, flagged content)
 * - PROCESSING: User upload being processed (file validation, storage, AI analysis)
 * - ACTIVE: Approved and visible in public gallery (was AVAILABLE for uploads, ACTIVE for curated)
 * - FLAGGED: Flagged for review due to content concerns or quality issues
 * - REJECTED: Rejected by moderator, hidden from public view
 * - ARCHIVED: Soft deleted, hidden from public but recoverable (was DELETED for uploads)
 */
enum class GalleryMediaStatus {
    /** Awaiting moderation - initial state for external media, or after upload processing. */
    PENDING_REVIEW,

    /** User upload being processed (file validation, storage, AI analysis). */
    PROCESSING,

    /** Approved and visible in public gallery. */
    ACTIVE,

    /** Flagged for review due to content concerns or quality issues. */
    FLAGGED,

    /** Rejected by moderator, hidden from public view. */
    REJECTED,

    /** Soft deleted, hidden from public but recoverable. */
    ARCHIVED
}
