package com.nosilha.core.gallery.api.dto

import com.nosilha.core.gallery.domain.GalleryMedia
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.domain.MediaSource
import java.time.Instant
import java.util.UUID

/**
 * Response DTO for media metadata.
 *
 * Provides comprehensive information about an uploaded media file.
 */
data class MediaResponse(
    val id: UUID,
    val fileName: String,
    val originalName: String,
    val contentType: String,
    val fileSize: Long,
    val publicUrl: String?,
    val status: GalleryMediaStatus,
    val source: MediaSource,
    val entryId: UUID?,
    val category: String?,
    val description: String?,
    val displayOrder: Int,
    val uploadedBy: UUID?,
    val createdAt: Instant?,
    val updatedAt: Instant?,
) {
    companion object {
        /**
         * Converts a GalleryMedia entity to MediaResponse DTO.
         */
        fun from(media: GalleryMedia): MediaResponse {
            require(media is com.nosilha.core.gallery.domain.UserUploadedMedia) {
                "MediaResponse.from only supports UserUploadedMedia. For ExternalMedia, use GalleryMediaDto.from instead."
            }
            return MediaResponse(
                id = media.id!!,
                fileName = media.fileName ?: "",
                originalName = media.originalName ?: "",
                contentType = media.contentType ?: "",
                fileSize = media.fileSize ?: 0L,
                publicUrl = media.publicUrl,
                status = media.status,
                source = media.source ?: MediaSource.LOCAL,
                entryId = media.entryId,
                category = media.category,
                description = media.description,
                displayOrder = media.displayOrder,
                uploadedBy = media.uploadedBy,
                createdAt = media.createdAt,
                updatedAt = media.updatedAt,
            )
        }
    }
}
