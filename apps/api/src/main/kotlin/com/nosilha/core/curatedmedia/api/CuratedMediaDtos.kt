package com.nosilha.core.curatedmedia.api

import com.nosilha.core.curatedmedia.domain.CuratedMedia
import com.nosilha.core.curatedmedia.domain.ExternalPlatform
import com.nosilha.core.curatedmedia.domain.MediaType
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.LocalDateTime
import java.util.UUID

/**
 * Public response DTO for curated media items displayed in the gallery.
 *
 * <p>This DTO exposes curated media to public API consumers with all necessary
 * display information including resolved embed URLs and thumbnails.</p>
 *
 * @property id Unique identifier for the media item
 * @property mediaType Type of media (IMAGE, VIDEO, AUDIO)
 * @property platform Source platform (YOUTUBE, VIMEO, SOUNDCLOUD, SELF_HOSTED)
 * @property url Direct URL for self-hosted content
 * @property thumbnailUrl Thumbnail/poster image URL (auto-generated for YouTube)
 * @property title Display title of the media item
 * @property description Detailed description of the content
 * @property author Creator or source of the media
 * @property category Category for filtering (e.g., "Historical", "Nature")
 * @property displayOrder Sort order within gallery (lower values first)
 * @property embedUrl Platform-specific embed URL for video/audio
 * @property createdAt Timestamp when the item was created
 */
data class CuratedMediaDto(
    val id: UUID,
    val mediaType: MediaType,
    val platform: ExternalPlatform,
    val url: String?,
    val thumbnailUrl: String?,
    val title: String,
    val description: String?,
    val author: String?,
    val category: String?,
    val displayOrder: Int,
    val embedUrl: String?,
    val createdAt: LocalDateTime,
)

/**
 * Request DTO for creating new curated media items.
 *
 * <p>Used by admin endpoints to add new media to the gallery.
 * All fields are validated according to entity constraints.</p>
 *
 * <p><strong>Validation Rules:</strong></p>
 * <ul>
 *   <li>Title: Required, 1-255 characters</li>
 *   <li>Description: Optional, max 2048 characters</li>
 *   <li>Category: Optional, max 50 characters</li>
 *   <li>Author: Optional, max 100 characters</li>
 *   <li>External ID: Optional, max 100 characters</li>
 *   <li>URLs: Optional, max 1024 characters</li>
 *   <li>Display Order: 0-9999</li>
 * </ul>
 *
 * @property mediaType Type of media (IMAGE, VIDEO, AUDIO)
 * @property platform Source platform
 * @property externalId Platform-specific identifier (YouTube video ID, etc.)
 * @property url Direct URL for the media content
 * @property thumbnailUrl Custom thumbnail URL (optional for YouTube)
 * @property title Display title
 * @property description Detailed description
 * @property author Creator or source
 * @property category Filtering category
 * @property displayOrder Sort order (default: 0)
 */
data class CreateCuratedMediaRequest(
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

/**
 * Request DTO for updating existing curated media items.
 *
 * <p>All fields are optional to support partial updates.
 * Only provided fields will be updated on the entity.</p>
 *
 * @property mediaType Type of media (IMAGE, VIDEO, AUDIO)
 * @property platform Source platform
 * @property externalId Platform-specific identifier
 * @property url Direct URL for the media content
 * @property thumbnailUrl Custom thumbnail URL
 * @property title Display title
 * @property description Detailed description
 * @property author Creator or source
 * @property category Filtering category
 * @property displayOrder Sort order
 */
data class UpdateCuratedMediaRequest(
    val mediaType: MediaType? = null,
    val platform: ExternalPlatform? = null,
    @field:Size(max = 100, message = "External ID must not exceed 100 characters")
    val externalId: String? = null,
    @field:Size(max = 1024, message = "URL must not exceed 1024 characters")
    val url: String? = null,
    @field:Size(max = 1024, message = "Thumbnail URL must not exceed 1024 characters")
    val thumbnailUrl: String? = null,
    @field:Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
    val title: String? = null,
    @field:Size(max = 2048, message = "Description must not exceed 2048 characters")
    val description: String? = null,
    @field:Size(max = 100, message = "Author must not exceed 100 characters")
    val author: String? = null,
    @field:Size(max = 50, message = "Category must not exceed 50 characters")
    val category: String? = null,
    @field:Min(0, message = "Display order must be non-negative")
    @field:Max(9999, message = "Display order must not exceed 9999")
    val displayOrder: Int? = null,
)

/**
 * Extension function to convert CuratedMedia entity to DTO.
 *
 * <p>Maps entity fields to DTO with resolved embed URLs and thumbnails.
 * Uses helper methods from the entity to generate platform-specific URLs.</p>
 *
 * @return CuratedMediaDto with all display-ready data
 */
fun CuratedMedia.toDto(): CuratedMediaDto =
    CuratedMediaDto(
        id = this.id!!,
        mediaType = this.mediaType,
        platform = this.platform,
        url = this.url,
        thumbnailUrl = this.resolvedThumbnailUrl(),
        title = this.title,
        description = this.description,
        author = this.author,
        category = this.category,
        displayOrder = this.displayOrder,
        embedUrl = this.getEmbedUrl(),
        createdAt = this.createdAt,
    )
