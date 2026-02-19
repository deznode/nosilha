package com.nosilha.core.gallery.api.dto

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.nosilha.core.gallery.domain.CreditPlatform
import com.nosilha.core.gallery.domain.ExternalMedia
import com.nosilha.core.gallery.domain.ExternalPlatform
import com.nosilha.core.gallery.domain.GalleryMedia
import com.nosilha.core.gallery.domain.MediaType
import com.nosilha.core.gallery.domain.UserUploadedMedia
import java.time.Instant
import java.util.UUID

/**
 * Lean public response DTO for gallery media items.
 *
 * Excludes internal/sensitive data that should not be exposed to unauthenticated
 * API consumers: AI analysis fields, storage internals, internal UUIDs, and
 * privacy tracking metadata.
 *
 * Used by public GET endpoints in [com.nosilha.core.gallery.api.GalleryController].
 * Admin endpoints continue using [GalleryMediaDto] which includes all fields.
 */
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "mediaSource",
    visible = true,
)
@JsonSubTypes(
    JsonSubTypes.Type(value = PublicGalleryMediaDto.UserUpload::class, name = "USER_UPLOAD"),
    JsonSubTypes.Type(value = PublicGalleryMediaDto.External::class, name = "EXTERNAL"),
)
sealed class PublicGalleryMediaDto {
    abstract val id: UUID
    abstract val title: String?
    abstract val description: String?
    abstract val category: String?
    abstract val displayOrder: Int
    abstract val mediaSource: String
    abstract val createdAt: Instant?

    /**
     * Public DTO for user-uploaded media.
     *
     * Excludes: storageKey, fileName, originalName, contentType, fileSize,
     * uploadedBy UUID, source, status, AI fields, gpsPrivacyLevel, photoType,
     * orientation, altitude.
     */
    data class UserUpload(
        override val id: UUID,
        override val title: String?,
        override val description: String?,
        override val category: String?,
        override val displayOrder: Int,
        override val mediaSource: String = "USER_UPLOAD",
        override val createdAt: Instant?,
        val publicUrl: String?,
        val entryId: UUID?,
        val uploaderDisplayName: String? = null,
        // EXIF metadata (public-safe)
        val latitude: Double?,
        val longitude: Double?,
        val dateTaken: Instant?,
        val cameraMake: String?,
        val cameraModel: String?,
        // Manual metadata for historical photos
        val approximateDate: String?,
        val locationName: String?,
        val photographerCredit: String?,
        val archiveSource: String?,
        // Smart credit attribution
        val creditPlatform: CreditPlatform? = null,
        val creditHandle: String? = null,
    ) : PublicGalleryMediaDto()

    /**
     * Public DTO for admin-curated external media.
     *
     * Excludes: curatedBy UUID (keeps curatorDisplayName for attribution).
     */
    data class External(
        override val id: UUID,
        override val title: String?,
        override val description: String?,
        override val category: String?,
        override val displayOrder: Int,
        override val mediaSource: String = "EXTERNAL",
        override val createdAt: Instant?,
        val mediaType: MediaType,
        val platform: ExternalPlatform,
        val externalId: String?,
        val url: String?,
        val thumbnailUrl: String?,
        val embedUrl: String?,
        val author: String?,
        val curatorDisplayName: String? = null,
        // Smart credit attribution
        val creditPlatform: CreditPlatform? = null,
        val creditHandle: String? = null,
    ) : PublicGalleryMediaDto()

    companion object {
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
                createdAt = media.createdAt,
                publicUrl = media.publicUrl,
                entryId = media.entryId,
                uploaderDisplayName = uploaderDisplayName,
                latitude = media.latitude?.toDouble(),
                longitude = media.longitude?.toDouble(),
                dateTaken = media.dateTaken,
                cameraMake = media.cameraMake,
                cameraModel = media.cameraModel,
                approximateDate = media.approximateDate,
                locationName = media.locationName,
                photographerCredit = media.photographerCredit,
                archiveSource = media.archiveSource,
                creditPlatform = media.creditPlatform,
                creditHandle = media.creditHandle,
            )

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
                createdAt = media.createdAt,
                mediaType = media.mediaType,
                platform = media.platform,
                externalId = media.externalId,
                url = media.url,
                thumbnailUrl = media.resolvedThumbnailUrl(),
                embedUrl = media.getEmbedUrl(),
                author = media.author,
                curatorDisplayName = curatorDisplayName,
                creditPlatform = media.creditPlatform,
                creditHandle = media.creditHandle,
            )
    }
}

/**
 * Extension function to convert any GalleryMedia entity to its public DTO.
 *
 * @param displayNames Map of user IDs to display names for resolving uploader/curator names
 * @throws IllegalStateException if the media type is not supported
 */
fun GalleryMedia.toPublicDto(displayNames: Map<UUID, String> = emptyMap()): PublicGalleryMediaDto =
    when (this) {
        is UserUploadedMedia -> PublicGalleryMediaDto.from(this, this.uploadedBy?.let { displayNames[it] })
        is ExternalMedia -> PublicGalleryMediaDto.from(this, this.curatedBy?.let { displayNames[it] })
        else -> error("Unknown GalleryMedia type: ${this.javaClass.simpleName}")
    }
