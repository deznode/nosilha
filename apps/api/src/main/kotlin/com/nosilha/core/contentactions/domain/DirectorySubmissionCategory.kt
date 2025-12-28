package com.nosilha.core.contentactions.domain

/**
 * Category enum for directory submission entries.
 *
 * <p>Defines the type of directory entry being submitted.
 * Aligned with frontend DirectorySubmission category type.</p>
 */
enum class DirectorySubmissionCategory {
    /** Restaurants, cafés, and dining establishments */
    RESTAURANT,

    /** Historical landmarks and points of interest */
    LANDMARK,

    /** Natural sites, hiking trails, and outdoor attractions */
    NATURE,

    /** Cultural venues, museums, and heritage sites */
    CULTURE,
}
