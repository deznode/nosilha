package com.nosilha.core.feedback.domain

/**
 * Category enum for directory submission entries.
 *
 * <p>Defines the type of directory entry being submitted.
 * Aligned with frontend DirectorySubmission category type and
 * DirectoryEntry subclasses in the places module.</p>
 */
enum class DirectorySubmissionCategory {
    /** Restaurants, cafés, and dining establishments */
    RESTAURANT,

    /** Hotels, guesthouses, and accommodations */
    HOTEL,

    /** Beaches and coastal destinations */
    BEACH,

    /** Heritage sites, historical landmarks, and cultural monuments */
    HERITAGE,

    /** Natural sites, hiking trails, and outdoor attractions */
    NATURE,
}
