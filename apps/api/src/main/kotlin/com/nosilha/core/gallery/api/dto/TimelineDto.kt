package com.nosilha.core.gallery.api.dto

/**
 * Response DTO for the gallery timeline aggregation endpoint.
 *
 * Groups gallery media by decade for the timeline view.
 *
 * @property groups List of decade groups with sample photos
 * @property totalCount Total number of media items across all groups
 */
data class TimelineDto(
    val groups: List<DecadeGroupDto>,
    val totalCount: Int,
)

/**
 * A single decade group in the timeline.
 *
 * @property decade Machine-readable decade key (e.g., "pre-1975", "1975-1990")
 * @property label Human-readable label (e.g., "Pre-1975", "1975–1990")
 * @property count Number of media items in this decade
 * @property samplePhotos Up to 3 sample photos for preview thumbnails
 */
data class DecadeGroupDto(
    val decade: String,
    val label: String,
    val count: Int,
    val samplePhotos: List<PublicGalleryMediaDto>,
)
