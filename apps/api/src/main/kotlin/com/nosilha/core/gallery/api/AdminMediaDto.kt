package com.nosilha.core.gallery.api

import com.nosilha.core.gallery.domain.GalleryMedia
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.Instant
import java.time.LocalDateTime
import java.util.UUID

/**
 * DTO for media list view in admin moderation queue.
 *
 * <p>Used in GET /api/v1/admin/media endpoint. Provides a compact view
 * for displaying media submissions in a queue or list format.</p>
 *
 * @property id Unique identifier of the media
 * @property fileName Generated filename for storage
 * @property originalName Original filename as uploaded
 * @property contentType MIME type of the file
 * @property fileSize File size in bytes
 * @property publicUrl Public URL for accessing the media
 * @property status Current moderation status
 * @property severity Queue priority (0=normal, 1=low, 2=medium, 3=high)
 * @property uploadedBy User who uploaded the media
 * @property createdAt Timestamp when media was uploaded
 */
data class AdminMediaListDto(
    val id: UUID,
    val fileName: String,
    val originalName: String,
    val contentType: String,
    val fileSize: Long,
    val publicUrl: String?,
    val status: GalleryMediaStatus,
    val severity: Int,
    val uploadedBy: String?,
    val createdAt: LocalDateTime?,
)

/**
 * DTO for media detail view in admin moderation panel.
 *
 * <p>Used in GET /api/v1/admin/media/{id} endpoint. Provides complete
 * information for reviewing and moderating a media file.</p>
 *
 * @property id Unique identifier of the media
 * @property fileName Generated filename for storage
 * @property originalName Original filename as uploaded
 * @property contentType MIME type of the file
 * @property fileSize File size in bytes
 * @property storageKey R2 object key (path within bucket)
 * @property publicUrl Public URL for accessing the media
 * @property entryId Optional association with directory entry
 * @property category Media category (e.g., "hero", "gallery")
 * @property description User-provided description
 * @property displayOrder Display order for sorting
 * @property status Current moderation status
 * @property severity Queue priority (0=normal, 1=low, 2=medium, 3=high)
 * @property reviewedBy Admin who reviewed the media
 * @property reviewedAt Timestamp of review
 * @property rejectionReason Reason for rejection or flagging
 * @property uploadedBy User who uploaded the media
 * @property createdAt Timestamp when media was uploaded
 * @property updatedAt Timestamp when media was last updated
 */
data class AdminMediaDetailDto(
    val id: UUID,
    val fileName: String,
    val originalName: String,
    val contentType: String,
    val fileSize: Long,
    val storageKey: String,
    val publicUrl: String?,
    val entryId: UUID?,
    val category: String?,
    val description: String?,
    val displayOrder: Int,
    val status: GalleryMediaStatus,
    val severity: Int,
    val reviewedBy: UUID?,
    val reviewedAt: Instant?,
    val rejectionReason: String?,
    val uploadedBy: String?,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?,
)

/**
 * Media moderation action enum.
 *
 * <p>Used in the request body for updating media status.</p>
 */
enum class MediaModerationAction {
    /** Approve the media and make it publicly available */
    APPROVE,

    /** Flag the media for further review with severity */
    FLAG,

    /** Reject the media and soft delete it */
    REJECT,
}

/**
 * Request DTO for updating media status.
 *
 * <p>Used in PUT /api/v1/admin/media/{id} endpoint.
 * Allows admins to approve, flag, or reject media files.</p>
 *
 * @property action The moderation action to take (APPROVE, FLAG, or REJECT)
 * @property reason Required for FLAG and REJECT actions; explanation for the decision
 * @property severity Optional severity level for FLAG action (0=normal, 1=low, 2=medium, 3=high)
 */
data class UpdateGalleryMediaStatusRequest(
    @field:NotNull(message = "Action is required")
    val action: MediaModerationAction,
    @field:Size(max = 1024, message = "Reason cannot exceed 1024 characters")
    val reason: String? = null,
    val severity: Int? = null,
)

/**
 * Extension function to convert Media entity to list DTO.
 *
 * <p>Maps domain entity to compact list view for admin queue.</p>
 *
 * @return AdminMediaListDto with essential fields for list display
 */
fun GalleryMedia.toAdminListDto() =
    AdminMediaListDto(
        id = this.id!!,
        fileName = if (this is com.nosilha.core.gallery.domain.UserUploadedMedia) this.fileName ?: "" else "",
        originalName = if (this is com.nosilha.core.gallery.domain.UserUploadedMedia) this.originalName ?: "" else this.title,
        contentType = if (this is com.nosilha.core.gallery.domain.UserUploadedMedia) this.contentType ?: "" else "",
        fileSize = if (this is com.nosilha.core.gallery.domain.UserUploadedMedia) this.fileSize ?: 0L else 0L,
        publicUrl = if (this is com.nosilha.core.gallery.domain.UserUploadedMedia) {
            this.publicUrl
        } else if (this is com.nosilha.core.gallery.domain.ExternalMedia) {
            this.resolvedThumbnailUrl()
        } else {
            null
        },
        status = this.status,
        severity = this.severity ?: 0,
        uploadedBy = if (this is com.nosilha.core.gallery.domain.UserUploadedMedia) {
            this.uploadedBy
        } else if (this is com.nosilha.core.gallery.domain.ExternalMedia) {
            this.curatedBy
        } else {
            null
        },
        createdAt = this.createdAt,
    )

/**
 * Extension function to convert Media entity to detail DTO.
 *
 * <p>Maps domain entity to complete detail view for admin review.</p>
 *
 * @return AdminMediaDetailDto with all fields for detailed review
 */
fun GalleryMedia.toAdminDetailDto() =
    AdminMediaDetailDto(
        id = this.id!!,
        fileName = if (this is com.nosilha.core.gallery.domain.UserUploadedMedia) this.fileName ?: "" else "",
        originalName = if (this is com.nosilha.core.gallery.domain.UserUploadedMedia) this.originalName ?: "" else this.title,
        contentType = if (this is com.nosilha.core.gallery.domain.UserUploadedMedia) this.contentType ?: "" else "",
        fileSize = if (this is com.nosilha.core.gallery.domain.UserUploadedMedia) this.fileSize ?: 0L else 0L,
        storageKey = if (this is com.nosilha.core.gallery.domain.UserUploadedMedia) this.storageKey ?: "" else "",
        publicUrl = if (this is com.nosilha.core.gallery.domain.UserUploadedMedia) {
            this.publicUrl
        } else if (this is com.nosilha.core.gallery.domain.ExternalMedia) {
            this.resolvedThumbnailUrl()
        } else {
            null
        },
        entryId = if (this is com.nosilha.core.gallery.domain.UserUploadedMedia) this.entryId else null,
        category = this.category,
        description = this.description,
        displayOrder = this.displayOrder,
        status = this.status,
        severity = this.severity ?: 0,
        reviewedBy = this.reviewedBy,
        reviewedAt = this.reviewedAt,
        rejectionReason = this.rejectionReason,
        uploadedBy = if (this is com.nosilha.core.gallery.domain.UserUploadedMedia) {
            this.uploadedBy
        } else if (this is com.nosilha.core.gallery.domain.ExternalMedia) {
            this.curatedBy
        } else {
            null
        },
        createdAt = this.createdAt,
        updatedAt = this.updatedAt,
    )
