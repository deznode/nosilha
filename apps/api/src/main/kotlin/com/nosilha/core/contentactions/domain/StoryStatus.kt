package com.nosilha.core.contentactions.domain

/**
 * Status enum for story moderation workflow.
 *
 * State Transitions:
 * - PENDING → APPROVED: Admin approves
 * - PENDING → REJECTED: Admin rejects
 * - PENDING → NEEDS_REVISION: Admin requests edits
 * - NEEDS_REVISION → PENDING: Author resubmits (future feature)
 * - APPROVED → PUBLISHED: Admin publishes
 */
enum class StoryStatus {
    /** Awaiting admin review (default) */
    PENDING,

    /** Accepted, ready for publication */
    APPROVED,

    /** Declined by admin */
    REJECTED,

    /** Returned to author for edits */
    NEEDS_REVISION,

    /** Published and visible */
    PUBLISHED,
}
