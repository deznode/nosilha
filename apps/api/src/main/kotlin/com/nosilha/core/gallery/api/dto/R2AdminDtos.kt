package com.nosilha.core.gallery.api.dto

import jakarta.validation.Valid
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

// --- Bucket Listing ---

data class R2ObjectDto(
    val key: String,
    val size: Long,
    val lastModified: Instant,
    val publicUrl: String,
)

data class R2BucketListResponse(
    val objects: List<R2ObjectDto>,
    val continuationToken: String?,
    val isTruncated: Boolean,
)

// --- Bulk Presign ---

data class BulkPresignFileRequest(
    @field:NotBlank(message = "File name is required")
    @field:Size(max = 255, message = "File name must be at most 255 characters")
    val fileName: String,
    @field:NotBlank(message = "Content type is required")
    @field:Pattern(
        regexp = "^(image/(jpeg|png|webp|gif)|video/mp4)$",
        message = "Unsupported file type. Allowed: JPEG, PNG, WebP, GIF, MP4",
    )
    val contentType: String,
    @field:Min(value = 1, message = "File size must be at least 1 byte")
    @field:Max(value = 52428800, message = "File exceeds 50MB limit")
    val fileSize: Long,
)

data class BulkPresignRequest(
    @field:Valid
    @field:Size(min = 1, max = 20, message = "Batch must contain 1 to 20 files")
    val files: List<BulkPresignFileRequest>,
)

data class BulkPresignItemResponse(
    val fileName: String,
    val uploadUrl: String,
    val key: String,
    val expiresAt: Instant,
)

data class BulkPresignResponse(
    val presigns: List<BulkPresignItemResponse>,
)

// --- Bulk Confirm ---

data class BulkConfirmUploadDto(
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
    @field:Size(max = 100, message = "Category must be at most 100 characters")
    val category: String? = null,
    @field:Size(max = 2048, message = "Description must be at most 2048 characters")
    val description: String? = null,
)

data class BulkConfirmRequest(
    @field:Valid
    @field:Size(min = 1, max = 20, message = "Batch must contain 1 to 20 uploads")
    val uploads: List<BulkConfirmUploadDto>,
)

data class BulkConfirmResponse(
    val accepted: Int,
    val rejected: Int,
    val created: List<UUID>,
    val errors: List<BatchUploadError>,
)

data class BatchUploadError(
    val key: String,
    val reason: String,
)

// --- Orphan Detection ---

typealias OrphanObjectDto = R2ObjectDto

data class OrphanDetectionResponse(
    val orphans: List<OrphanObjectDto>,
    val totalScanned: Int,
    val continuationToken: String?,
    val isTruncated: Boolean,
)

// --- Orphan Linking ---

data class LinkOrphanRequest(
    @field:NotBlank(message = "Storage key is required")
    @field:Size(max = 512, message = "Storage key must be at most 512 characters")
    val storageKey: String,
    @field:Size(max = 100, message = "Category must be at most 100 characters")
    val category: String? = null,
    @field:Size(max = 2048, message = "Description must be at most 2048 characters")
    val description: String? = null,
)

// --- Orphan Deletion ---

data class DeleteOrphanRequest(
    @field:NotBlank(message = "Storage key is required")
    @field:Size(max = 512, message = "Storage key must be at most 512 characters")
    val storageKey: String,
)
