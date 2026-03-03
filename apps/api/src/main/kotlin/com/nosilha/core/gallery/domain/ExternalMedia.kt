package com.nosilha.core.gallery.domain

import jakarta.persistence.Column
import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import java.util.UUID

/**
 * Gallery media subclass for admin-curated external content.
 *
 * Represents externally-hosted media (YouTube videos, external images, podcasts)
 * curated by admins for display in the public gallery.
 *
 * Purpose:
 * - Gallery page content (photos, videos, podcasts)
 * - YouTube embeds and external video platforms
 * - Editorially curated content selected by admins
 *
 * Moderation Workflow:
 * PENDING_REVIEW → ACTIVE → ARCHIVED
 *
 * @see GalleryMedia
 * @see GalleryMediaStatus
 * @see MediaType
 * @see ExternalPlatform
 */
@Entity
@DiscriminatorValue("EXTERNAL")
class ExternalMedia : GalleryMedia() {
    /**
     * Type of media: IMAGE, VIDEO, or AUDIO.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", length = 20)
    var mediaType: MediaType = MediaType.VIDEO

    /**
     * Source platform: YOUTUBE, VIMEO, SOUNDCLOUD, or SELF_HOSTED.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "platform", length = 30)
    var platform: ExternalPlatform = ExternalPlatform.YOUTUBE

    /**
     * External identifier for platform-specific content.
     * - YouTube/Vimeo: video ID (e.g., "dQw4w9WgXcQ")
     * - SoundCloud: track ID
     * - Self-hosted: null or custom identifier
     */
    @Column(name = "external_id", length = 100)
    var externalId: String? = null

    /**
     * Direct URL for the media content.
     * - Self-hosted: full URL to the media file
     * - SoundCloud: full embed URL
     * - YouTube/Vimeo: optional, can use externalId instead
     */
    @Column(name = "url", length = 1024)
    var url: String? = null

    /**
     * Thumbnail/poster image URL.
     * For YouTube, if null, auto-generates from externalId via resolvedThumbnailUrl().
     */
    @Column(name = "thumbnail_url", length = 1024)
    var thumbnailUrl: String? = null

    /**
     * Author or creator of the media content.
     */
    @Column(name = "author", length = 100)
    var author: String? = null

    /**
     * User ID of the admin who curated this media.
     * References Supabase auth user ID.
     */
    @Column(name = "curated_by")
    var curatedBy: UUID? = null

    /**
     * Generates platform-specific embed URL for video/audio content.
     *
     * Returns:
     * - YouTube: https://www.youtube.com/embed/{externalId}
     * - Vimeo: https://player.vimeo.com/video/{externalId}
     * - SoundCloud: url field (requires full embed URL)
     * - Self-hosted: url field
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
     * If thumbnailUrl is a valid image URL, returns it directly. If it contains
     * a non-image URL (e.g. a YouTube watch or embed URL), it is treated as
     * missing and the auto-generation fallback is used instead.
     *
     * For YouTube, auto-generates high-quality thumbnail from externalId using
     * YouTube's thumbnail API: https://img.youtube.com/vi/{id}/hqdefault.jpg
     *
     * @return Thumbnail URL string or null if not available
     */
    fun resolvedThumbnailUrl(): String? =
        thumbnailUrl?.takeUnless { isNonImageUrl(it) }
            ?: when (platform) {
                ExternalPlatform.YOUTUBE -> externalId?.let { "https://img.youtube.com/vi/$it/hqdefault.jpg" }
                else -> null
            }

    companion object {
        private val NON_IMAGE_URL_PATTERNS = listOf(
            "youtube.com/watch",
            "youtube.com/embed",
            "youtu.be/",
            "vimeo.com/",
            "soundcloud.com/",
        )

        /**
         * Detects URLs that are video/audio page URLs rather than image URLs.
         */
        private fun isNonImageUrl(url: String): Boolean = NON_IMAGE_URL_PATTERNS.any { url.contains(it, ignoreCase = true) }

        /**
         * Normalizes a thumbnail URL before persistence.
         * Returns null for non-image URLs (e.g. YouTube watch URLs) so that
         * [resolvedThumbnailUrl] can auto-generate the correct thumbnail.
         */
        fun normalizeThumbnailUrl(url: String?): String? = url?.takeUnless { isNonImageUrl(it) }
    }
}
