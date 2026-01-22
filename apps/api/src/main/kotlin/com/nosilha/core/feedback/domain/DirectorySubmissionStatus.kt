package com.nosilha.core.feedback.domain

/**
 * Status enum for directory submission moderation workflow.
 *
 * <p>State Transitions:</p>
 * <ul>
 *   <li>PENDING → APPROVED: Admin approves the directory entry</li>
 *   <li>PENDING → REJECTED: Admin rejects the directory entry</li>
 *   <li>PENDING → FLAGGED: Admin flags for attention</li>
 *   <li>APPROVED → ARCHIVED: Admin soft-deletes the entry</li>
 *   <li>ARCHIVED: Entry is hidden from public but recoverable</li>
 * </ul>
 *
 * <p>Aligned with frontend SubmissionStatus type for consistency.</p>
 */
enum class DirectorySubmissionStatus {
    /** Awaiting admin review (default state) */
    PENDING,

    /** Approved by admin, ready to be added to directory */
    APPROVED,

    /** Rejected by admin with optional feedback */
    REJECTED,

    /** Flagged for attention */
    FLAGGED,

    /** Soft-deleted entry - hidden from public but recoverable */
    ARCHIVED,
}
