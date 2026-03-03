package com.nosilha.core.gallery.api.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
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
)
