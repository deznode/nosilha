package com.nosilha.core.gallery.domain

import com.nosilha.core.auth.api.UserProfileQueryService
import com.nosilha.core.gallery.api.dto.CreateExternalMediaRequest
import com.nosilha.core.gallery.api.dto.GalleryMediaDto
import com.nosilha.core.gallery.api.dto.GalleryModerationAction
import com.nosilha.core.gallery.api.dto.contributorIds
import com.nosilha.core.gallery.api.dto.toDto
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import com.nosilha.core.gallery.repository.MediaModerationAuditRepository
import com.nosilha.core.shared.api.PageableInfo
import com.nosilha.core.shared.api.PagedApiResult
import com.nosilha.core.shared.events.HeroImagePromotedEvent
import com.nosilha.core.shared.events.MediaAnalysisBatchRequestedEvent
import com.nosilha.core.shared.events.MediaAnalysisRequestedEvent
import com.nosilha.core.shared.exception.BusinessException
import com.nosilha.core.shared.exception.ResourceNotFoundException
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * Service for managing unified gallery media moderation queue and actions.
 *
 * Handles administrative moderation of all gallery media (UserUploadedMedia and ExternalMedia)
 * through a unified queue. Provides approval, flagging, and rejection workflows with full
 * audit trail support.
 *
 * Moderation Actions:
 * - APPROVE: Changes status to ACTIVE, making media publicly visible
 * - FLAG: Changes status to FLAGGED, requires reason and optional severity
 * - REJECT: Changes status to REJECTED, requires reason
 *
 * The service maintains polymorphic support for both media types while enforcing
 * consistent moderation policies across the gallery.
 *
 * @property repository Repository for gallery media entities (polymorphic)
 * @property auditRepository Repository for moderation audit trail
 */
@Service
class GalleryModerationService(
    private val repository: GalleryMediaRepository,
    private val auditRepository: MediaModerationAuditRepository,
    private val eventPublisher: ApplicationEventPublisher,
    private val userProfileQueryService: UserProfileQueryService,
) {
    /**
     * Lists gallery media for moderation with optional status filtering and pagination.
     *
     * Admin endpoint to view moderation queue with support for filtering by status.
     * Page size is capped at 100 to prevent excessive data transfer. Results are ordered
     * by creation date descending to show newest submissions first.
     *
     * Returns both UserUploadedMedia and ExternalMedia in a unified queue.
     *
     * @param status Optional status filter (PENDING_REVIEW, PROCESSING, FLAGGED, ACTIVE, REJECTED, ARCHIVED). If null, returns all media.
     * @param page Zero-based page number
     * @param size Number of items per page (max 100)
     * @return Paginated API result of gallery media DTOs
     */
    @Transactional(readOnly = true)
    fun listMediaForModeration(
        status: GalleryMediaStatus?,
        page: Int,
        size: Int,
    ): PagedApiResult<GalleryMediaDto> {
        val pageable = PageRequest.of(page, minOf(size, 100))
        val mediaPage =
            if (status != null) {
                repository.findByStatusOrderByCreatedAtDesc(status, pageable)
            } else {
                repository.findAll(pageable)
            }

        logger.debug { "Retrieved ${mediaPage.numberOfElements} gallery media items (page $page, size $size, status: $status)" }

        val displayNames = resolveDisplayNames(mediaPage.content)
        val dtos = mediaPage.content.map { it.toDto(displayNames) }

        return PagedApiResult(
            data = dtos,
            pageable = PageableInfo(
                page = mediaPage.number,
                size = mediaPage.size,
                totalElements = mediaPage.totalElements,
                totalPages = mediaPage.totalPages,
                first = mediaPage.isFirst,
                last = mediaPage.isLast
            )
        )
    }

    /**
     * Gets detailed information for a specific gallery media item.
     *
     * Admin endpoint to view complete media details for review including
     * all metadata, moderation history, and type-specific fields.
     *
     * Supports both UserUploadedMedia and ExternalMedia.
     *
     * @param id UUID of the media item
     * @return Media detail DTO with all fields, or null if not found
     */
    @Transactional(readOnly = true)
    fun getMediaDetail(id: UUID): GalleryMediaDto? {
        val media = repository.findById(id).orElse(null) ?: return null

        logger.debug { "Retrieved media detail: id=$id, status=${media.status}, type=${media.mediaSource}" }

        val displayNames = resolveDisplayNames(listOf(media))
        return media.toDto(displayNames)
    }

    /**
     * Updates media status based on moderation action.
     *
     * Performs the specified moderation action (APPROVE, FLAG, or REJECT) and records
     * the action in the audit trail. Validation rules are enforced for each action type.
     *
     * Validation Rules:
     * - FLAG action requires a reason
     * - REJECT action requires a reason
     * - Severity for FLAG action must be 0-3 (0=normal, 1=low, 2=medium, 3=high)
     *
     * Status Transitions:
     * - APPROVE: Current status → ACTIVE
     * - FLAG: Current status → FLAGGED (with severity and reason)
     * - REJECT: Current status → REJECTED (with reason)
     *
     * Works uniformly across both UserUploadedMedia and ExternalMedia.
     *
     * @param id UUID of the media item
     * @param action Moderation action to perform (APPROVE, FLAG, or REJECT)
     * @param reason Admin-provided reason for the action (required for FLAG and REJECT)
     * @param severity Queue priority for FLAG action (0=normal, 1=low, 2=medium, 3=high)
     * @param performedBy UUID of the admin user performing the action
     * @return Updated media DTO, or null if not found
     * @throws BusinessException if validation fails
     */
    @Transactional
    fun updateStatus(
        id: UUID,
        action: GalleryModerationAction,
        reason: String?,
        severity: Int?,
        performedBy: UUID,
    ): GalleryMediaDto? {
        val media = repository.findById(id).orElse(null) ?: return null

        // Validate action-specific requirements
        when (action) {
            GalleryModerationAction.FLAG -> {
                if (reason.isNullOrBlank()) {
                    throw BusinessException("Reason is required when flagging media")
                }
                if (severity != null && (severity < 0 || severity > 3)) {
                    throw BusinessException("Severity must be between 0 and 3")
                }
            }
            GalleryModerationAction.REJECT -> {
                if (reason.isNullOrBlank()) {
                    throw BusinessException("Reason is required when rejecting media")
                }
            }
            GalleryModerationAction.APPROVE -> {
                // No additional validation needed for approve
            }
        }

        val previousStatus = media.status

        // Update media entity based on action
        when (action) {
            GalleryModerationAction.APPROVE -> {
                media.status = GalleryMediaStatus.ACTIVE
                media.reviewedBy = performedBy
                media.reviewedAt = Instant.now()
                media.rejectionReason = null // Clear any previous rejection reason
                logger.info { "Gallery media approved: id=$id, type=${media.mediaSource}, performedBy=$performedBy" }
            }
            GalleryModerationAction.FLAG -> {
                media.status = GalleryMediaStatus.FLAGGED
                media.severity = severity ?: 0
                media.rejectionReason = reason // Store flag reason in rejection_reason field
                media.reviewedBy = performedBy
                media.reviewedAt = Instant.now()
                logger.info { "Gallery media flagged: id=$id, type=${media.mediaSource}, severity=$severity, performedBy=$performedBy" }
            }
            GalleryModerationAction.REJECT -> {
                media.status = GalleryMediaStatus.REJECTED
                media.rejectionReason = reason
                media.reviewedBy = performedBy
                media.reviewedAt = Instant.now()
                logger.info { "Gallery media rejected: id=$id, type=${media.mediaSource}, reason=$reason, performedBy=$performedBy" }
            }
        }

        val savedMedia = repository.save(media)

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

        logger.debug { "Audit entry created for gallery media moderation: mediaId=$id, action=$action, performedBy=$performedBy" }

        val displayNames = resolveDisplayNames(listOf(savedMedia))
        return savedMedia.toDto(displayNames)
    }

    /**
     * Soft deletes a gallery media item (archives it).
     *
     * Changes media status to ARCHIVED without permanently removing the record.
     * This allows for recovery if needed and maintains audit trail integrity.
     *
     * Intended for removing spam, inappropriate content, or duplicates while
     * preserving the ability to restore if the deletion was made in error.
     *
     * Works uniformly across both UserUploadedMedia and ExternalMedia.
     *
     * @param id UUID of the media item to delete
     * @param performedBy UUID of the admin user performing the deletion
     */
    @Transactional
    fun archiveMedia(
        id: UUID,
        performedBy: UUID,
    ) {
        val media = repository.findById(id).orElse(null) ?: return

        val previousStatus = media.status
        media.status = GalleryMediaStatus.ARCHIVED
        media.reviewedBy = performedBy
        media.reviewedAt = Instant.now()

        repository.save(media)

        // Create audit entry
        val audit =
            MediaModerationAudit(
                mediaId = id,
                action = "DELETE",
                previousStatus = previousStatus.name,
                newStatus = GalleryMediaStatus.ARCHIVED.name,
                reason = "Media archived by admin",
                performedBy = performedBy,
            )
        auditRepository.save(audit)

        logger.info { "Gallery media archived: id=$id, type=${media.mediaSource}, performedBy=$performedBy" }
    }

    /**
     * Admin directly creates external media (bypasses review).
     *
     * Creates ExternalMedia with ACTIVE status, immediately visible in gallery.
     *
     * @param request Request containing external media details
     * @param adminId Admin creating the media
     * @return Created ExternalMedia DTO
     */
    @Transactional
    fun createExternalMedia(
        request: CreateExternalMediaRequest,
        adminId: String,
    ): GalleryMediaDto.External {
        logger.info { "Admin $adminId creating external media: ${request.title}" }

        val media = ExternalMedia().apply {
            this.mediaType = request.mediaType
            this.platform = request.platform
            this.externalId = request.externalId
            this.url = request.url
            this.thumbnailUrl = request.thumbnailUrl
            this.title = request.title
            this.description = request.description
            this.author = request.author
            this.category = request.category
            this.displayOrder = request.displayOrder ?: 0
            this.status = GalleryMediaStatus.ACTIVE
            this.curatedBy = adminId
        }

        val saved = repository.save(media)
        logger.info { "Created ExternalMedia as ACTIVE: id=${saved.id}" }

        val displayName = userProfileQueryService.findDisplayName(adminId)
        return GalleryMediaDto.from(saved, displayName)
    }

    /**
     * Promotes a gallery image to become the hero image for its associated directory entry.
     *
     * This action publishes a HeroImagePromotedEvent that the Places module will consume
     * to update the directory entry's imageUrl field. This maintains Spring Modulith
     * module boundaries by using event-driven communication.
     *
     * Prerequisites:
     * - Media must be a UserUploadedMedia (not ExternalMedia)
     * - Media must have ACTIVE status (approved)
     * - Media must have an entryId (linked to a directory entry)
     * - Media must have a publicUrl (accessible via CDN)
     *
     * @param mediaId UUID of the media item to promote
     * @param adminId UUID of the admin user performing the promotion
     * @throws NotFoundException if media not found
     * @throws BusinessException if validation fails
     */
    @Transactional
    fun promoteToHeroImage(
        mediaId: UUID,
        adminId: UUID,
    ) {
        val media = repository.findById(mediaId).orElseThrow {
            ResourceNotFoundException("Media not found: $mediaId")
        }

        // Validations
        if (media !is UserUploadedMedia) {
            throw BusinessException("Only user uploads can be promoted to hero image")
        }
        if (media.status != GalleryMediaStatus.ACTIVE) {
            throw BusinessException("Media must be ACTIVE to promote as hero image")
        }
        if (media.entryId == null) {
            throw BusinessException("Media must be linked to a directory entry")
        }
        if (media.publicUrl.isNullOrBlank()) {
            throw BusinessException("Media must have a public URL")
        }

        // Publish event - Places module will handle the update
        eventPublisher.publishEvent(
            HeroImagePromotedEvent(
                entryId = media.entryId!!,
                imageUrl = media.publicUrl!!,
                mediaId = mediaId,
                promotedBy = adminId,
            ),
        )

        logger.info { "Published HeroImagePromotedEvent for entry ${media.entryId}, media $mediaId, by admin $adminId" }
    }

    /**
     * Triggers AI analysis for a single media item.
     *
     * Creates an [AnalysisRun] tracking record and publishes a [MediaAnalysisRequestedEvent].
     * Returns 202 Accepted semantics — analysis happens asynchronously.
     *
     * @param mediaId UUID of the media item to analyze
     * @param adminId UUID of the admin triggering the analysis
     * @return the created AnalysisRun ID
     * @throws ResourceNotFoundException if media not found
     * @throws BusinessException if media is not eligible for analysis
     */
    @Transactional
    fun triggerAnalysis(
        mediaId: UUID,
        adminId: UUID,
    ): UUID {
        val media = repository.findById(mediaId).orElseThrow {
            ResourceNotFoundException("Media not found: $mediaId")
        }

        validateMediaForAnalysis(media)
        val userMedia = media as UserUploadedMedia

        val runId = UUID.randomUUID()

        eventPublisher.publishEvent(
            MediaAnalysisRequestedEvent(
                mediaId = mediaId,
                imageUrl = userMedia.publicUrl!!,
                mediaTitle = userMedia.title,
                requestedBy = adminId,
                analysisRunId = runId,
            ),
        )

        logger.info { "Triggered AI analysis for media $mediaId, run $runId, by admin $adminId" }
        return runId
    }

    /**
     * Triggers AI analysis for multiple media items in a batch.
     *
     * Creates an [AnalysisBatch] record plus individual [AnalysisRun] records.
     * Items that fail validation are skipped and reported in the response.
     *
     * @param mediaIds list of media IDs to analyze
     * @param adminId UUID of the admin triggering the batch
     * @return batch result with accepted/rejected counts and errors
     */
    @Transactional
    fun triggerBatchAnalysis(
        mediaIds: List<UUID>,
        adminId: UUID,
    ): BatchAnalysisResult {
        val errors = mutableListOf<BatchError>()
        val validMedia = mutableListOf<UserUploadedMedia>()

        for (id in mediaIds) {
            val media = repository.findById(id).orElse(null)
            if (media == null) {
                errors.add(BatchError(id, "Media not found"))
                continue
            }
            if (media !is UserUploadedMedia) {
                errors.add(BatchError(id, "Only user uploads can be analyzed"))
                continue
            }
            if (media.status != GalleryMediaStatus.ACTIVE) {
                errors.add(BatchError(id, "Media is not ACTIVE"))
                continue
            }
            if (media.publicUrl.isNullOrBlank()) {
                errors.add(BatchError(id, "Media has no public URL"))
                continue
            }
            validMedia.add(media)
        }

        if (validMedia.isEmpty()) {
            return BatchAnalysisResult(
                batchId = null,
                accepted = 0,
                rejected = errors.size,
                errors = errors,
            )
        }

        val batchId = UUID.randomUUID()

        eventPublisher.publishEvent(
            MediaAnalysisBatchRequestedEvent(
                batchId = batchId,
                totalItems = validMedia.size,
                requestedBy = adminId,
            ),
        )

        for (media in validMedia) {
            val runId = UUID.randomUUID()
            eventPublisher.publishEvent(
                MediaAnalysisRequestedEvent(
                    mediaId = media.id!!,
                    imageUrl = media.publicUrl!!,
                    mediaTitle = media.title,
                    requestedBy = adminId,
                    analysisRunId = runId,
                    batchId = batchId,
                ),
            )
        }

        logger.info {
            "Triggered batch AI analysis: batch $batchId, " +
                "${validMedia.size} accepted, ${errors.size} rejected, by admin $adminId"
        }

        return BatchAnalysisResult(
            batchId = batchId,
            accepted = validMedia.size,
            rejected = errors.size,
            errors = errors,
        )
    }

    private fun resolveDisplayNames(mediaList: List<GalleryMedia>): Map<String, String> {
        val userIds = mediaList.contributorIds()
        return if (userIds.isNotEmpty()) userProfileQueryService.findDisplayNames(userIds) else emptyMap()
    }

    private fun validateMediaForAnalysis(media: GalleryMedia) {
        if (media !is UserUploadedMedia) {
            throw BusinessException("Only user uploads can be analyzed by AI")
        }
        if (media.status != GalleryMediaStatus.ACTIVE) {
            throw BusinessException("Media must be ACTIVE for AI analysis (current: ${media.status})")
        }
        if (media.publicUrl.isNullOrBlank()) {
            throw BusinessException("Media must have a public URL for AI analysis")
        }
    }
}

/**
 * Result of a batch analysis trigger.
 */
data class BatchAnalysisResult(
    val batchId: UUID?,
    val accepted: Int,
    val rejected: Int,
    val errors: List<BatchError>,
)

/**
 * Error detail for a rejected batch item.
 */
data class BatchError(
    val mediaId: UUID,
    val reason: String,
)
