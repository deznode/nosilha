package com.nosilha.core.curatedmedia.domain

/**
 * Enum representing the publication status of curated media.
 *
 * <p>Controls the visibility and lifecycle state of gallery media items.</p>
 *
 * <ul>
 *   <li>ACTIVE: Published and visible in the gallery</li>
 *   <li>ARCHIVED: Hidden from public view but preserved for records</li>
 * </ul>
 */
enum class CuratedMediaStatus {
    /**
     * Published and visible in the gallery.
     */
    ACTIVE,

    /**
     * Hidden from public view but preserved for records.
     * Archived items can be restored to ACTIVE status.
     */
    ARCHIVED
}
