package com.nosilha.core.contentactions.domain

/**
 * Status enum for directory submission moderation workflow.
 *
 * <p>State Transitions:</p>
 * <ul>
 *   <li>PENDING → APPROVED: Admin approves the directory entry</li>
 *   <li>PENDING → REJECTED: Admin rejects the directory entry</li>
 *   <li>APPROVED: Entry is approved and ready to be added to directory</li>
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
}
