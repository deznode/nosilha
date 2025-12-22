package com.nosilha.core.media.api.dto

import com.fasterxml.jackson.annotation.JsonFormat
import com.nosilha.core.media.domain.Media
import com.nosilha.core.media.domain.MediaSource
import com.nosilha.core.media.domain.MediaStatus
import java.time.LocalDateTime
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
    val status: MediaStatus,
    val source: MediaSource,
    val entryId: UUID?,
    val category: String?,
    val description: String?,
    val displayOrder: Int,
    val uploadedBy: String?,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    val createdAt: LocalDateTime?,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    val updatedAt: LocalDateTime?,
) {
    companion object {
        /**
         * Converts a Media entity to MediaResponse DTO.
         */
        fun from(media: Media): MediaResponse =
            MediaResponse(
                id = media.id!!,
                fileName = media.fileName,
                originalName = media.originalName,
                contentType = media.contentType,
                fileSize = media.fileSize,
                publicUrl = media.publicUrl,
                status = media.status,
                source = media.source,
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
