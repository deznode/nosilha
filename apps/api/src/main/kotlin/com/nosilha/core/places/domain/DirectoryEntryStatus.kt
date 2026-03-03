package com.nosilha.core.places.domain

/**
 * Lifecycle status for directory entries.
 *
 * <p>State Transitions:</p>
 * <ul>
 *   <li>Community submission: → PENDING (awaiting admin review)</li>
 *   <li>Admin approval: PENDING → APPROVED (ready to publish)</li>
 *   <li>Admin publish: APPROVED → PUBLISHED (live on site)</li>
 *   <li>Admin rejection: PENDING → ARCHIVED (with admin notes)</li>
 *   <li>Soft delete: Any → ARCHIVED</li>
 * </ul>
 *
 * <p>Seeded data starts with PUBLISHED status.</p>
 */
enum class DirectoryEntryStatus {
    /** User is still editing (future use for draft submissions) */
    DRAFT,

    /** Awaiting admin review (default for community submissions) */
    PENDING,

    /** Admin approved, ready to publish */
    APPROVED,

    /** Live on site (default for seeded entries) */
    PUBLISHED,

    /** Soft-deleted or rejected - hidden from public but recoverable */
    ARCHIVED,
}
