package com.nosilha.core.gallery.api.dto

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.nosilha.core.gallery.domain.CreditPlatform
import com.nosilha.core.gallery.domain.ExternalMedia
import com.nosilha.core.gallery.domain.ExternalPlatform
import com.nosilha.core.gallery.domain.GalleryMedia
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.domain.MediaSource
import com.nosilha.core.gallery.domain.MediaType
import com.nosilha.core.gallery.domain.UserUploadedMedia
import java.time.Instant
import java.util.UUID

/**
 * Unified response DTO for all gallery media items.
 *
 * This sealed class provides a polymorphic response type that can represent
 * both user-uploaded media and admin-curated external content. The discriminator
 * field "mediaSource" allows clients to distinguish between the two types.
 *
 * Subclasses:
 * - UserUpload: Media uploaded by users to Cloudflare R2
 * - External: Admin-curated external content (YouTube, Vimeo, etc.)
 *
 * Usage:
 * - GET /api/v1/gallery - Returns mixed list of UserUpload and External items
 * - GET /api/v1/gallery/{id} - Returns either UserUpload or External based on ID
 */
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "mediaSource",
    visible = true
)
@JsonSubTypes(
    JsonSubTypes.Type(value = GalleryMediaDto.UserUpload::class, name = "USER_UPLOAD"),
    JsonSubTypes.Type(value = GalleryMediaDto.External::class, name = "EXTERNAL")
)
sealed class GalleryMediaDto {
    abstract val id: UUID
    abstract val title: String?
    abstract val description: String?
    abstract val category: String?
    abstract val displayOrder: Int
    abstract val status: GalleryMediaStatus
    abstract val mediaSource: String
    abstract val showInGallery: Boolean

    abstract val altText: String?
    abstract val createdAt: Instant?

    /**
     * DTO for user-uploaded media stored in Cloudflare R2.
     *
     * Includes storage-specific fields like fileName, storageKey, publicUrl,
     * contentType, and fileSize for user-uploaded files.
     *
     * Also includes EXIF metadata (GPS, date, camera info), privacy tracking,
     * and manual metadata for historical photos without EXIF data.
     */
    data class UserUpload(
        override val id: UUID,
        override val title: String?,
        override val description: String?,
        override val category: String?,
        override val displayOrder: Int,
        override val status: GalleryMediaStatus,
        override val mediaSource: String = "USER_UPLOAD",
        override val showInGallery: Boolean,
        override val altText: String?,
        override val createdAt: Instant?,
        val fileName: String,
        val originalName: String,
        val storageKey: String,
        val publicUrl: String?,
        val contentType: String,
        val fileSize: Long,
        val entryId: UUID?,
        val source: MediaSource?,
        val uploadedBy: UUID?,
        // EXIF metadata (privacy-processed)
        val latitude: Double?,
        val longitude: Double?,
        val altitude: Double?,
        val dateTaken: Instant?,
        val cameraMake: String?,
        val cameraModel: String?,
        val orientation: Int?,
        // Privacy tracking
        val photoType: String?,
        val gpsPrivacyLevel: String?,
        // Manual metadata for historical photos
        val approximateDate: String?,
        val locationName: String?,
        val photographerCredit: String?,
        val archiveSource: String?,
        // Display name
        val uploaderDisplayName: String? = null,
        // Smart credit attribution
        val creditPlatform: CreditPlatform? = null,
        val creditHandle: String? = null,
        // AI-generated fields
        val aiTitle: String? = null,
        val aiTags: List<String>? = null,
        val aiLabels: String? = null,
        val aiAltText: String? = null,
        val aiDescription: String? = null,
        val aiProcessedAt: Instant? = null,
    ) : GalleryMediaDto()

    /**
     * DTO for admin-curated external media (YouTube, Vimeo, etc.).
     *
     * Includes platform-specific fields like mediaType, platform, externalId,
     * url, thumbnailUrl, embedUrl, and author for external content.
     */
    data class External(
        override val id: UUID,
        override val title: String?,
        override val description: String?,
        override val category: String?,
        override val displayOrder: Int,
        override val status: GalleryMediaStatus,
        override val mediaSource: String = "EXTERNAL",
        override val showInGallery: Boolean,
        override val altText: String?,
        override val createdAt: Instant?,
        val mediaType: MediaType,
        val platform: ExternalPlatform,
        val externalId: String?,
        val url: String?,
        val thumbnailUrl: String?,
        val embedUrl: String?,
        val author: String?,
        val curatedBy: UUID?,
        val curatorDisplayName: String? = null,
        // Smart credit attribution
        val creditPlatform: CreditPlatform? = null,
        val creditHandle: String? = null,
        // Featured video fields
        val durationSeconds: Int? = null,
        val featured: Boolean = false,
    ) : GalleryMediaDto()

    companion object {
        /**
         * Converts a UserUploadedMedia entity to UserUpload DTO.
         */
        fun from(
            media: UserUploadedMedia,
            uploaderDisplayName: String? = null,
        ): UserUpload =
            UserUpload(
                id = media.id!!,
                title = media.title,
                description = media.description,
                category = media.category,
                displayOrder = media.displayOrder,
                status = media.status,
                mediaSource = "USER_UPLOAD",
                showInGallery = media.showInGallery,
                altText = media.altText,
                createdAt = media.createdAt,
                fileName = media.fileName ?: "",
                originalName = media.originalName ?: "",
                storageKey = media.storageKey ?: "",
                publicUrl = media.publicUrl,
                contentType = media.contentType ?: "",
                fileSize = media.fileSize ?: 0L,
                entryId = media.entryId,
                source = media.source,
                uploadedBy = media.uploadedBy,
                // EXIF metadata
                latitude = media.latitude?.toDouble(),
                longitude = media.longitude?.toDouble(),
                altitude = media.altitude?.toDouble(),
                dateTaken = media.dateTaken,
                cameraMake = media.cameraMake,
                cameraModel = media.cameraModel,
                orientation = media.orientation,
                // Privacy tracking
                photoType = media.photoType,
                gpsPrivacyLevel = media.gpsPrivacyLevel,
                // Manual metadata
                approximateDate = media.approximateDate,
                locationName = media.locationName,
                photographerCredit = media.photographerCredit,
                archiveSource = media.archiveSource,
                // Display name
                uploaderDisplayName = uploaderDisplayName,
                // Smart credit attribution
                creditPlatform = media.creditPlatform,
                creditHandle = media.creditHandle,
                // AI-generated fields
                aiTitle = media.aiTitle,
                aiTags = media.aiTags?.toList(),
                aiLabels = media.aiLabels,
                aiAltText = media.aiAltText,
                aiDescription = media.aiDescription,
                aiProcessedAt = media.aiProcessedAt,
            )

        /**
         * Converts an ExternalMedia entity to External DTO.
         */
        fun from(
            media: ExternalMedia,
            curatorDisplayName: String? = null,
        ): External =
            External(
                id = media.id!!,
                title = media.title,
                description = media.description,
                category = media.category,
                displayOrder = media.displayOrder,
                status = media.status,
                mediaSource = "EXTERNAL",
                showInGallery = media.showInGallery,
                altText = media.altText,
                createdAt = media.createdAt,
                mediaType = media.mediaType,
                platform = media.platform,
                externalId = media.externalId,
                url = media.url,
                thumbnailUrl = media.resolvedThumbnailUrl(),
                embedUrl = media.getEmbedUrl(),
                author = media.author,
                curatedBy = media.curatedBy,
                curatorDisplayName = curatorDisplayName,
                // Smart credit attribution
                creditPlatform = media.creditPlatform,
                creditHandle = media.creditHandle,
                // Featured video fields
                durationSeconds = media.durationSeconds,
                featured = media.featured,
            )
    }
}

/**
 * Extension function to convert any GalleryMedia entity to its appropriate DTO.
 *
 * This provides a cleaner API than using companion object methods directly,
 * enabling usage like `media.toDto()` instead of pattern matching on type.
 *
 * @param displayNames Map of user IDs to display names for resolving uploader/curator names
 * @throws IllegalStateException if the media type is not supported
 */
fun GalleryMedia.toDto(displayNames: Map<UUID, String> = emptyMap()): GalleryMediaDto =
    when (this) {
        is UserUploadedMedia -> GalleryMediaDto.from(this, this.uploadedBy?.let { displayNames[it] })
        is ExternalMedia -> GalleryMediaDto.from(this, this.curatedBy?.let { displayNames[it] })
        else -> error("Unknown GalleryMedia type: ${this.javaClass.simpleName}")
    }

/**
 * Extracts distinct contributor user IDs from a list of gallery media.
 *
 * Returns uploader IDs for user uploads and curator IDs for external media.
 * Used for batch-resolving display names via [UserProfileQueryService].
 */
fun List<GalleryMedia>.contributorIds(): List<UUID> =
    mapNotNull { media ->
        when (media) {
            is UserUploadedMedia -> media.uploadedBy
            is ExternalMedia -> media.curatedBy
            else -> null
        }
    }.distinct()
