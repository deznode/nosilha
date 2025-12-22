package com.nosilha.core.media.api.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

/**
 * Request DTO for generating a presigned upload URL.
 *
 * Validates file metadata before issuing a presigned URL for direct R2 upload.
 *
 * @property fileName Original filename (for extension extraction)
 * @property contentType MIME type - must be one of the allowed types
 * @property fileSize File size in bytes - must be ≤ 50MB
 */
data class PresignRequest(
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
    @field:Max(value = 52428800, message = "File exceeds 50MB limit for direct uploads")
    val fileSize: Long,
)
