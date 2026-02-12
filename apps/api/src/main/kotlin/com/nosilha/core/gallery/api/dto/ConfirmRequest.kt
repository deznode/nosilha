package com.nosilha.core.gallery.api.dto

import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

/**
 * Request DTO for confirming a completed upload.
 *
 * Called after the client successfully uploads to R2 using the presigned URL.
 * Creates the media metadata record with PROCESSING status.
 *
 * @property key Storage key from presign response
 * @property originalName Original filename as uploaded by user
 * @property contentType MIME type (must match presign request)
 * @property fileSize Actual file size uploaded
 * @property entryId Optional directory entry association
 * @property category Optional media category (e.g., "hero", "gallery")
 * @property description Optional user-provided description
 *
 * EXIF Metadata (extracted client-side, privacy-processed):
 * @property latitude GPS latitude (privacy-processed based on photoType)
 * @property longitude GPS longitude (privacy-processed based on photoType)
 * @property altitude GPS altitude in meters
 * @property dateTaken Original capture date from EXIF
 * @property cameraMake Camera manufacturer
 * @property cameraModel Camera model
 * @property orientation EXIF orientation (1-8)
 * @property photoType Photo type determining GPS privacy: CULTURAL_SITE, COMMUNITY_EVENT, PERSONAL
 * @property gpsPrivacyLevel Applied privacy level: FULL, APPROXIMATE, STRIPPED, NONE
 *
 * Manual Metadata (for historical photos):
 * @property approximateDate Manual date entry (e.g., "circa 1960s")
 * @property locationName Manual location name (e.g., "Vila Nova Sintra")
 * @property photographerCredit Photographer name
 * @property archiveSource Source of historical photo
 */
data class ConfirmRequest(
    @field:NotBlank(message = "Storage key is required")
    @field:Size(max = 512, message = "Storage key must be at most 512 characters")
    val key: String,
    @field:NotBlank(message = "Original name is required")
    @field:Size(max = 255, message = "Original name must be at most 255 characters")
    val originalName: String,
    @field:NotBlank(message = "Content type is required")
    @field:Pattern(
        regexp = "^(image/(jpeg|png|webp|gif)|video/mp4)$",
        message = "Unsupported file type",
    )
    val contentType: String,
    @field:Min(value = 1, message = "File size must be at least 1 byte")
    @field:Max(value = 52428800, message = "File size exceeds 50MB limit")
    val fileSize: Long,
    val entryId: UUID? = null,
    @field:Size(max = 100, message = "Category must be at most 100 characters")
    val category: String? = null,
    @field:Size(max = 2048, message = "Description must be at most 2048 characters")
    val description: String? = null,
    // --- EXIF Metadata (extracted client-side, privacy-processed) ---
    @field:DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @field:DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    val latitude: Double? = null,
    @field:DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @field:DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    val longitude: Double? = null,
    val altitude: Double? = null,
    val dateTaken: Instant? = null,
    @field:Size(max = 100, message = "Camera make must be at most 100 characters")
    val cameraMake: String? = null,
    @field:Size(max = 100, message = "Camera model must be at most 100 characters")
    val cameraModel: String? = null,
    @field:Min(value = 1, message = "Orientation must be between 1 and 8")
    @field:Max(value = 8, message = "Orientation must be between 1 and 8")
    val orientation: Int? = null,
    // --- Privacy Tracking ---
    @field:Pattern(
        regexp = "^(CULTURAL_SITE|COMMUNITY_EVENT|PERSONAL)$",
        message = "Invalid photo type",
    )
    val photoType: String? = null,
    @field:Pattern(
        regexp = "^(FULL|APPROXIMATE|STRIPPED|NONE)$",
        message = "Invalid GPS privacy level",
    )
    val gpsPrivacyLevel: String? = null,
    // --- Manual Metadata (for historical photos) ---
    @field:Size(max = 100, message = "Approximate date must be at most 100 characters")
    val approximateDate: String? = null,
    @field:Size(max = 255, message = "Location name must be at most 255 characters")
    val locationName: String? = null,
    @field:Size(max = 255, message = "Photographer credit must be at most 255 characters")
    val photographerCredit: String? = null,
    @field:Size(max = 255, message = "Archive source must be at most 255 characters")
    val archiveSource: String? = null,
)
