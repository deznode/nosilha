package com.nosilha.core.curatedmedia.domain

import com.nosilha.core.shared.domain.AuditableEntity
import jakarta.persistence.*
import java.util.UUID

/**
 * Represents admin-curated external media content for the Nos Ilha gallery.
 *
 * <p>This entity stores references to externally-hosted media (YouTube videos,
 * external images, podcasts) that are curated by admins for display in the
 * public gallery. It is separate from the user-uploaded Media entity which
 * handles R2 storage uploads.</p>
 *
 * <p><strong>Purpose:</strong></p>
 * <ul>
 *   <li>Gallery page content (photos, videos, podcasts)</li>
 *   <li>YouTube embeds and external video platforms</li>
 *   <li>Editorially curated content selected by admins</li>
 * </ul>
 *
 * <p><strong>Constraints:</strong></p>
 * <ul>
 *   <li>Title: Required, max 255 characters</li>
 *   <li>Description: Optional, max 2048 characters</li>
 *   <li>Category: Optional, max 50 characters (e.g., "Historical", "Nature")</li>
 *   <li>External ID: Optional, max 100 characters (YouTube video ID, etc.)</li>
 *   <li>URLs: Optional, max 1024 characters</li>
 * </ul>
 *
 * <p><strong>Helper Methods:</strong></p>
 * <ul>
 *   <li>{@link #getEmbedUrl()}: Generates platform-specific embed URL</li>
 *   <li>{@link #resolvedThumbnailUrl()}: Returns thumbnail or auto-generates for YouTube</li>
 * </ul>
 *
 * @see AuditableEntity
 * @see MediaType
 * @see ExternalPlatform
 * @see CuratedMediaStatus
 */
@Entity
@Table(
    name = "curated_media",
    indexes = [
        Index(name = "idx_curated_media_status", columnList = "status"),
        Index(name = "idx_curated_media_type", columnList = "media_type"),
        Index(name = "idx_curated_media_category", columnList = "category"),
        Index(name = "idx_curated_media_display_order", columnList = "display_order"),
    ]
)
class CuratedMedia : AuditableEntity() {
    /**
     * Unique identifier for the curated media item.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    var id: UUID? = null

    /**
     * Type of media: IMAGE, VIDEO, or AUDIO.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 20)
    var mediaType: MediaType = MediaType.IMAGE

    /**
     * Source platform: YOUTUBE, VIMEO, SOUNDCLOUD, or SELF_HOSTED.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    var platform: ExternalPlatform = ExternalPlatform.SELF_HOSTED

    /**
     * External identifier for platform-specific content.
     * <ul>
     *   <li>YouTube/Vimeo: video ID (e.g., "dQw4w9WgXcQ")</li>
     *   <li>SoundCloud: track ID</li>
     *   <li>Self-hosted: null or custom identifier</li>
     * </ul>
     */
    @Column(name = "external_id", length = 100)
    var externalId: String? = null

    /**
     * Direct URL for the media content.
     * <ul>
     *   <li>Self-hosted: full URL to the media file</li>
     *   <li>SoundCloud: full embed URL</li>
     *   <li>YouTube/Vimeo: optional, can use externalId instead</li>
     * </ul>
     */
    @Column(length = 1024)
    var url: String? = null

    /**
     * Thumbnail/poster image URL.
     * <p>For YouTube, if null, auto-generates from externalId via
     * {@link #resolvedThumbnailUrl()}.</p>
     */
    @Column(name = "thumbnail_url", length = 1024)
    var thumbnailUrl: String? = null

    /**
     * Display title for the media item.
     */
    @Column(nullable = false, length = 255)
    var title: String = ""

    /**
     * Detailed description of the media content.
     */
    @Column(length = 2048)
    var description: String? = null

    /**
     * Author or creator of the media content.
     */
    @Column(length = 100)
    var author: String? = null

    /**
     * Category for filtering and organization.
     * <p>Examples: "Landmark", "Historical", "Nature", "Culture", "Event", "Interview"</p>
     */
    @Column(length = 50)
    var category: String? = null

    /**
     * Display order within the gallery.
     * <p>Lower values appear first. Used for manual sorting by admins.</p>
     */
    @Column(name = "display_order", nullable = false)
    var displayOrder: Int = 0

    /**
     * Publication status: ACTIVE or ARCHIVED.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var status: CuratedMediaStatus = CuratedMediaStatus.ACTIVE

    /**
     * User ID of the admin who curated this media.
     * <p>References Supabase auth user ID.</p>
     */
    @Column(name = "curated_by", length = 100)
    var curatedBy: String? = null

    /**
     * Generates platform-specific embed URL for video/audio content.
     *
     * <p><strong>Returns:</strong></p>
     * <ul>
     *   <li>YouTube: https://www.youtube.com/embed/{externalId}</li>
     *   <li>Vimeo: https://player.vimeo.com/video/{externalId}</li>
     *   <li>SoundCloud: url field (requires full embed URL)</li>
     *   <li>Self-hosted: url field</li>
     * </ul>
     *
     * @return Embed URL string or null if not applicable
     */
    fun getEmbedUrl(): String? =
        when (platform) {
            ExternalPlatform.YOUTUBE -> externalId?.let { "https://www.youtube.com/embed/$it" }
            ExternalPlatform.VIMEO -> externalId?.let { "https://player.vimeo.com/video/$it" }
            ExternalPlatform.SOUNDCLOUD -> url
            ExternalPlatform.SELF_HOSTED -> url
        }

    /**
     * Returns thumbnail URL or auto-generates for YouTube videos.
     *
     * <p>If thumbnailUrl is set, returns it directly. Otherwise, for YouTube
     * platform, auto-generates high-quality thumbnail from externalId using
     * YouTube's thumbnail API: https://img.youtube.com/vi/{id}/hqdefault.jpg</p>
     *
     * @return Thumbnail URL string or null if not available
     */
    fun resolvedThumbnailUrl(): String? =
        thumbnailUrl ?: when (platform) {
            ExternalPlatform.YOUTUBE -> externalId?.let { "https://img.youtube.com/vi/$it/hqdefault.jpg" }
            else -> null
        }
}
