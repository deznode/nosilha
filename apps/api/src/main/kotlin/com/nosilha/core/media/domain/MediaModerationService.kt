package com.nosilha.core.media.domain

import com.nosilha.core.media.api.AdminMediaDetailDto
import com.nosilha.core.media.api.AdminMediaListDto
import com.nosilha.core.media.api.MediaModerationAction
import com.nosilha.core.media.api.toAdminDetailDto
import com.nosilha.core.media.api.toAdminListDto
import com.nosilha.core.media.repository.MediaModerationAuditRepository
import com.nosilha.core.media.repository.MediaRepository
import com.nosilha.core.shared.exception.BusinessException
import com.nosilha.core.shared.exception.ResourceNotFoundException
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * Service for managing media moderation queue and actions.
 *
 * <p>Handles administrative moderation of media files including approving, flagging,
 * and rejecting uploads. Maintains audit trail of all moderation actions and
 * supports filtering by status and pagination for queue display.</p>
 *
 * <p>Moderation Actions:</p>
 * <ul>
 *   <li>APPROVE: Changes status to AVAILABLE, making media publicly visible</li>
 *   <li>FLAG: Changes status to FLAGGED, requires reason and optional severity</li>
 *   <li>REJECT: Changes status to DELETED (soft delete), requires reason</li>
 * </ul>
 *
 * @property mediaRepository Repository for media file entities
 * @property auditRepository Repository for moderation audit trail
 */
@Service
class MediaModerationService(
    private val mediaRepository: MediaRepository,
    private val auditRepository: MediaModerationAuditRepository,
) {
    /**
     * Lists media files with optional status filtering and pagination.
     *
     * <p>Admin endpoint to view media queue with support for filtering by moderation status.
     * Page size is capped at 100 to prevent excessive data transfer. Results are ordered
     * by creation date descending to show newest uploads first.</p>
     *
     * @param status Optional status filter (PENDING, PROCESSING, PENDING_REVIEW, FLAGGED, AVAILABLE, DELETED). If null, returns all media.
     * @param page Zero-based page number
     * @param size Number of items per page (max 100)
     * @return Paginated list of media as list DTOs
     */
    @Transactional(readOnly = true)
    fun listPendingMedia(
        status: MediaStatus?,
        page: Int,
        size: Int,
    ): Page<AdminMediaListDto> {
        val pageable = PageRequest.of(page, minOf(size, 100))
        val media =
            if (status != null) {
                mediaRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
            } else {
                mediaRepository.findAll(pageable)
            }

        logger.debug { "Retrieved ${media.numberOfElements} media files (page $page, size $size, status: $status)" }
        return media.map { it.toAdminListDto() }
    }

    /**
     * Gets detailed information for a specific media file.
     *
     * <p>Admin endpoint to view complete media details for review including
     * all metadata, moderation history, and file information.</p>
     *
     * @param id UUID of the media file
     * @return Media detail DTO with all fields
     * @throws ResourceNotFoundException if media is not found
     */
    @Transactional(readOnly = true)
    fun getMediaDetail(id: UUID): AdminMediaDetailDto {
        val media =
            mediaRepository
                .findById(id)
                .orElseThrow { ResourceNotFoundException("Media not found with ID: $id") }

        logger.debug { "Retrieved media detail: id=$id, status=${media.status}" }
        return media.toAdminDetailDto()
    }

    /**
     * Updates media status based on moderation action.
     *
     * <p>Performs the specified moderation action (APPROVE, FLAG, or REJECT) and records
     * the action in the audit trail. Validation rules are enforced for each action type.</p>
     *
     * <h4>Validation Rules:</h4>
     * <ul>
     *   <li>FLAG action requires a reason</li>
     *   <li>REJECT action requires a reason</li>
     *   <li>Severity for FLAG action must be 0-3 (0=normal, 1=low, 2=medium, 3=high)</li>
     * </ul>
     *
     * <h4>Status Transitions:</h4>
     * <ul>
     *   <li>APPROVE: Current status → AVAILABLE</li>
     *   <li>FLAG: Current status → FLAGGED (with severity and reason)</li>
     *   <li>REJECT: Current status → DELETED (with reason)</li>
     * </ul>
     *
     * @param id UUID of the media file
     * @param action Moderation action to perform (APPROVE, FLAG, or REJECT)
     * @param reason Admin-provided reason for the action (required for FLAG and REJECT)
     * @param severity Queue priority for FLAG action (0=normal, 1=low, 2=medium, 3=high)
     * @param performedBy UUID of the admin user performing the action
     * @return Updated media detail DTO
     * @throws ResourceNotFoundException if media is not found
     * @throws BusinessException if validation fails
     */
    @Transactional
    fun updateStatus(
        id: UUID,
        action: MediaModerationAction,
        reason: String?,
        severity: Int?,
        performedBy: UUID,
    ): AdminMediaDetailDto {
        val media =
            mediaRepository
                .findById(id)
                .orElseThrow { ResourceNotFoundException("Media not found with ID: $id") }

        // Validate action-specific requirements
        when (action) {
            MediaModerationAction.FLAG -> {
                if (reason.isNullOrBlank()) {
                    throw BusinessException("Reason is required when flagging media")
                }
                if (severity != null && (severity < 0 || severity > 3)) {
                    throw BusinessException("Severity must be between 0 and 3")
                }
            }
            MediaModerationAction.REJECT -> {
                if (reason.isNullOrBlank()) {
                    throw BusinessException("Reason is required when rejecting media")
                }
            }
            MediaModerationAction.APPROVE -> {
                // No additional validation needed for approve
            }
        }

        val previousStatus = media.status

        // Update media entity based on action
        when (action) {
            MediaModerationAction.APPROVE -> {
                media.status = MediaStatus.AVAILABLE
                media.reviewedBy = performedBy
                media.reviewedAt = Instant.now()
                media.rejectionReason = null // Clear any previous rejection reason
                logger.info { "Media approved: id=$id, performedBy=$performedBy" }
            }
            MediaModerationAction.FLAG -> {
                media.status = MediaStatus.FLAGGED
                media.severity = severity ?: 0
                media.rejectionReason = reason // Store flag reason in rejection_reason field
                media.reviewedBy = performedBy
                media.reviewedAt = Instant.now()
                logger.info { "Media flagged: id=$id, severity=$severity, performedBy=$performedBy" }
            }
            MediaModerationAction.REJECT -> {
                media.status = MediaStatus.DELETED
                media.rejectionReason = reason
                media.reviewedBy = performedBy
                media.reviewedAt = Instant.now()
                logger.info { "Media rejected: id=$id, reason=$reason, performedBy=$performedBy" }
            }
        }

        val savedMedia = mediaRepository.save(media)

        // Create audit entry
        val audit =
            MediaModerationAudit(
                mediaId = id,
                action = action.name,
                previousStatus = previousStatus.name,
                newStatus = savedMedia.status.name,
                reason = reason,
                performedBy = performedBy,
            )
        auditRepository.save(audit)

        logger.debug { "Audit entry created for media moderation: mediaId=$id, action=$action, performedBy=$performedBy" }

        return savedMedia.toAdminDetailDto()
    }

    /**
     * Soft deletes a media file.
     *
     * <p>Changes media status to DELETED without permanently removing the record.
     * This allows for recovery if needed and maintains audit trail integrity.</p>
     *
     * <p>Intended for removing spam, inappropriate content, or duplicates while
     * preserving the ability to restore if the deletion was made in error.</p>
     *
     * @param id UUID of the media file to delete
     * @param performedBy UUID of the admin user performing the deletion
     * @throws ResourceNotFoundException if media is not found
     */
    @Transactional
    fun deleteMedia(
        id: UUID,
        performedBy: UUID,
    ) {
        val media =
            mediaRepository
                .findById(id)
                .orElseThrow { ResourceNotFoundException("Media not found with ID: $id") }

        val previousStatus = media.status
        media.status = MediaStatus.DELETED
        media.reviewedBy = performedBy
        media.reviewedAt = Instant.now()

        mediaRepository.save(media)

        // Create audit entry
        val audit =
            MediaModerationAudit(
                mediaId = id,
                action = "DELETE",
                previousStatus = previousStatus.name,
                newStatus = MediaStatus.DELETED.name,
                reason = "Media deleted by admin",
                performedBy = performedBy,
            )
        auditRepository.save(audit)

        logger.info { "Media deleted: id=$id, performedBy=$performedBy" }
    }
}
