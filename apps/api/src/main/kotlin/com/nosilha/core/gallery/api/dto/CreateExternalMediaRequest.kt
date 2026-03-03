package com.nosilha.core.gallery.api.dto

import com.nosilha.core.gallery.domain.ExternalPlatform
import com.nosilha.core.gallery.domain.MediaType
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

/**
 * Request DTO for admin to create new external media items.
 *
 * This DTO is used by the admin endpoint for directly creating external media
 * (YouTube videos, external images, podcasts) with ACTIVE status, bypassing
 * the moderation workflow.
 *
 * Validation Rules:
 * - Title: Required, 1-255 characters
 * - Description: Optional, max 2048 characters
 * - Category: Optional, max 50 characters
 * - Author: Optional, max 100 characters
 * - External ID: Optional, max 100 characters
 * - URLs: Optional, max 1024 characters
 * - Display Order: 0-9999
 *
 * Example Usage:
 * POST /api/v1/admin/gallery/external
 * {
 *   "mediaType": "VIDEO",
 *   "platform": "YOUTUBE",
 *   "externalId": "dQw4w9WgXcQ",
 *   "title": "Aerial View: Nova Sintra Gardens",
 *   "description": "Drone footage of the flower capital...",
 *   "author": "Community Upload",
 *   "category": "Nature",
 *   "displayOrder": 1
 * }
 */
data class CreateExternalMediaRequest(
    val mediaType: MediaType,
    val platform: ExternalPlatform,
    @field:Size(max = 100, message = "External ID must not exceed 100 characters")
    val externalId: String? = null,
    @field:Size(max = 1024, message = "URL must not exceed 1024 characters")
    val url: String? = null,
    @field:Size(max = 1024, message = "Thumbnail URL must not exceed 1024 characters")
    val thumbnailUrl: String? = null,
    @field:NotBlank(message = "Title is required")
    @field:Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
    val title: String,
    @field:Size(max = 2048, message = "Description must not exceed 2048 characters")
    val description: String? = null,
    @field:Size(max = 100, message = "Author must not exceed 100 characters")
    val author: String? = null,
    @field:Size(max = 50, message = "Category must not exceed 50 characters")
    val category: String? = null,
    @field:Min(0, message = "Display order must be non-negative")
    @field:Max(9999, message = "Display order must not exceed 9999")
    val displayOrder: Int = 0,
)
