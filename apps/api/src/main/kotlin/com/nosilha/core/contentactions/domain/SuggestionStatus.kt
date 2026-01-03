package com.nosilha.core.contentactions.domain

/**
 * Status enum for suggestion moderation workflow.
 *
 * State Transitions:
 * - PENDING → APPROVED: Admin approves suggestion
 * - PENDING → REJECTED: Admin rejects suggestion
 * - PENDING → FLAGGED: Admin flags for attention
 */
enum class SuggestionStatus {
    /** Awaiting admin review (default) */
    PENDING,

    /** Accepted by admin */
    APPROVED,

    /** Declined by admin */
    REJECTED,

    /** Flagged for attention */
    FLAGGED,
}
