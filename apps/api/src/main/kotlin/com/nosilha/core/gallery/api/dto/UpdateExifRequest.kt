package com.nosilha.core.gallery.api.dto

import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.Instant

/**
 * Request DTO for updating EXIF metadata on user-uploaded gallery media.
 *
 * PATCH semantics — only non-null fields are applied to the entity.
 * Used by the dedicated EXIF re-extraction endpoint to update GPS coordinates,
 * camera info, and privacy tracking fields after client-side extraction.
 *
 * All fields are optional. Only fields the admin selects in the comparison
 * modal are included in the request.
 */
data class UpdateExifRequest(
    @field:DecimalMin("-90.0", message = "Latitude must be >= -90")
    @field:DecimalMax("90.0", message = "Latitude must be <= 90")
    val latitude: Double? = null,
    @field:DecimalMin("-180.0", message = "Longitude must be >= -180")
    @field:DecimalMax("180.0", message = "Longitude must be <= 180")
    val longitude: Double? = null,
    val altitude: Double? = null,
    val dateTaken: Instant? = null,
    @field:Size(max = 100, message = "Camera make cannot exceed 100 characters")
    val cameraMake: String? = null,
    @field:Size(max = 100, message = "Camera model cannot exceed 100 characters")
    val cameraModel: String? = null,
    @field:Min(1, message = "Orientation must be >= 1")
    @field:Max(8, message = "Orientation must be <= 8")
    val orientation: Int? = null,
    @field:Pattern(
        regexp = "CULTURAL_SITE|COMMUNITY_EVENT|PERSONAL",
        message = "photoType must be CULTURAL_SITE, COMMUNITY_EVENT, or PERSONAL",
    )
    val photoType: String? = null,
    @field:Pattern(
        regexp = "FULL|APPROXIMATE|STRIPPED|NONE",
        message = "gpsPrivacyLevel must be FULL, APPROXIMATE, STRIPPED, or NONE",
    )
    val gpsPrivacyLevel: String? = null,
)
