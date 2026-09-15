package com.nosilha.core.gallery.domain

import com.nosilha.core.ai.domain.AiFeatureConfigService
import com.nosilha.core.auth.api.UserProfileQueryService
import com.nosilha.core.gallery.api.dto.BatchErrorDto
import com.nosilha.core.gallery.api.dto.CreateExternalMediaRequest
import com.nosilha.core.gallery.api.dto.CreditBackfillResponse
import com.nosilha.core.gallery.api.dto.GalleryMediaDto
import com.nosilha.core.gallery.api.dto.GalleryModerationAction
import com.nosilha.core.gallery.api.dto.UpdateExifRequest
import com.nosilha.core.gallery.api.dto.UpdateGalleryMediaRequest
import com.nosilha.core.gallery.api.dto.contributorIds
import com.nosilha.core.gallery.api.dto.toDto
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import com.nosilha.core.gallery.repository.MediaModerationAuditRepository
import com.nosilha.core.shared.api.PageableInfo
import com.nosilha.core.shared.api.PagedApiResult
import com.nosilha.core.shared.events.MediaAnalysisBatchRequestedEvent
import com.nosilha.core.shared.events.MediaAnalysisRequestedEvent
import com.nosilha.core.shared.exception.BusinessException
import com.nosilha.core.shared.exception.ResourceNotFoundException
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
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
    private val aiFeatureConfigService: AiFeatureConfigService,
) {
    companion object {
        /** The credit recorded when nobody knows who made a record (spec 033 FR-004). */
        const val NOT_KNOWN_CREDIT = "not known"

        const val HERO_NOT_STAMPED = "Only archive records are stamped; a hero keeps its recorded credit"

        /** Statuses eligible for AI analysis trigger. */
        private val ANALYSIS_ELIGIBLE_STATUSES = setOf(
            GalleryMediaStatus.ACTIVE,
            GalleryMediaStatus.PENDING_REVIEW,
        )
    }

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
        aiModerationStatus: String?,
        page: Int,
        size: Int,
    ): PagedApiResult<GalleryMediaDto> {
        val pageable = PageRequest.of(page, minOf(size, 100))
        val mediaPage = when {
            aiModerationStatus != null -> {
                repository.findByAiModerationStatus(status?.name, aiModerationStatus, pageable)
            }
            status != null -> {
                repository.findByStatusOrderByCreatedAtDesc(status, pageable)
            }
            else -> {
                repository.findAll(pageable)
            }
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
            GalleryModerationAction.APPROVE -> { }
        }

        val previousStatus = media.status

        when (action) {
            GalleryModerationAction.APPROVE -> {
                media.status = GalleryMediaStatus.ACTIVE
                media.reviewedBy = performedBy
                media.reviewedAt = Instant.now()
                media.rejectionReason = null
                logger.info { "Gallery media approved: id=$id, type=${media.mediaSource}, performedBy=$performedBy" }
            }
            GalleryModerationAction.FLAG -> {
                media.status = GalleryMediaStatus.FLAGGED
                media.severity = severity ?: 0
                media.rejectionReason = reason
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

        val audit =
            MediaModerationAudit(
                mediaId = id,
                action = action.name,
                previousStatus = previousStatus.name,
                newStatus = savedMedia.status.name,
                reason = reason,
            )
        auditRepository.save(audit)

        logger.debug { "Audit entry created for gallery media moderation: mediaId=$id, action=$action, performedBy=$performedBy" }

        val displayNames = resolveDisplayNames(listOf(savedMedia))
        return savedMedia.toDto(displayNames)
    }

    /**
     * Updates gallery media metadata with PATCH semantics.
     *
     * Only non-null fields in the request are applied. Type-specific fields
     * (author, photographerCredit) are applied only to the matching entity subclass.
     *
     * @param id UUID of the media item
     * @param request Update request with optional fields
     * @return Updated media DTO, or null if not found
     */
    @Transactional
    fun updateMediaMetadata(
        id: UUID,
        request: UpdateGalleryMediaRequest,
    ): GalleryMediaDto? {
        val media = repository.findById(id).orElse(null) ?: return null

        request.title?.let { media.title = it }
        request.description?.let { media.description = it }
        request.category?.let { media.category = it }
        request.showInGallery?.let { media.showInGallery = it }
        request.identifiablePerson?.let { media.identifiablePerson = it }

        if (request.author != null && media is ExternalMedia) {
            val parsed = CreditParser.parseCredit(request.author)
            media.author = parsed.displayName
            media.creditPlatform = parsed.platform
            media.creditHandle = parsed.handle
        }
        if (request.photographerCredit != null && media is UserUploadedMedia) {
            val parsed = CreditParser.parseCredit(request.photographerCredit)
            media.photographerCredit = parsed.displayName
            media.creditPlatform = parsed.platform
            media.creditHandle = parsed.handle
        }
        if (media is ExternalMedia) {
            request.durationSeconds?.let { media.durationSeconds = it }
            request.featured?.let { newFeatured ->
                if (newFeatured) {
                    repository.clearAllFeaturedVideos()
                }
                media.featured = newFeatured
            }
        }

        val saved = repository.save(media)

        logger.info { "Gallery media metadata updated: id=$id, type=${media.mediaSource}" }

        val displayNames = resolveDisplayNames(listOf(saved))
        return saved.toDto(displayNames)
    }

    /**
     * Stamps "not known" on uncredited records (spec 034 FR-024).
     *
     * Records flagged as showing an identifiable person are skipped: their credit waits
     * until provenance is confirmed (FR-022). An upload's credit is its photographer; a
     * film's is its author. Each stamp writes an audit row, so the change is reviewable.
     *
     * @param mediaIds Records to consider; null considers every archive record
     * @param performedBy Admin performing the action
     */
    @Transactional
    fun markCreditsNotKnown(
        mediaIds: List<UUID>?,
        performedBy: UUID,
    ): CreditBackfillResponse {
        val candidates: List<Pair<UUID, GalleryMedia?>> =
            mediaIds?.distinct()?.map { id -> id to repository.findById(id).orElse(null) }
                ?: repository.findAll().filter { it.role == MediaRole.ARCHIVE }.map { it.id!! to it }

        var updated = 0
        var skippedFlagged = 0
        val errors = mutableListOf<BatchErrorDto>()

        for ((id, media) in candidates) {
            when {
                media == null -> errors += BatchErrorDto(mediaId = id, reason = "Media not found")
                // Asked by id or not, a hero keeps the credit recorded with it
                media.role != MediaRole.ARCHIVE -> errors += BatchErrorDto(mediaId = id, reason = HERO_NOT_STAMPED)
                !creditOf(media).isNullOrBlank() -> {
                    // Listing every credited record would bury the ones asked about
                    if (mediaIds != null) errors += BatchErrorDto(mediaId = id, reason = "Media already has a credit")
                }
                media.identifiablePerson -> skippedFlagged++
                else -> {
                    stampNotKnown(media)
                    updated++
                }
            }
        }

        logger.info { "Admin $performedBy stamped 'not known' on $updated records, skipped $skippedFlagged flagged" }
        return CreditBackfillResponse(updated = updated, skippedFlagged = skippedFlagged, errors = errors)
    }

    private fun creditOf(media: GalleryMedia): String? =
        when (media) {
            is UserUploadedMedia -> media.photographerCredit
            is ExternalMedia -> media.author
            else -> null
        }

    private fun stampNotKnown(media: GalleryMedia) {
        when (media) {
            is UserUploadedMedia -> media.photographerCredit = NOT_KNOWN_CREDIT
            is ExternalMedia -> media.author = NOT_KNOWN_CREDIT
        }
        media.creditPlatform = null
        media.creditHandle = null
        repository.save(media)
        auditRepository.save(
            MediaModerationAudit(
                mediaId = media.id!!,
                action = "CREDIT_NOT_KNOWN",
                previousStatus = media.status.name,
                newStatus = media.status.name,
                reason = "Credit set to '$NOT_KNOWN_CREDIT' by bulk admin action",
            ),
        )
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

        val audit =
            MediaModerationAudit(
                mediaId = id,
                action = "DELETE",
                previousStatus = previousStatus.name,
                newStatus = GalleryMediaStatus.ARCHIVED.name,
                reason = "Media archived by admin",
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
        adminId: UUID,
    ): GalleryMediaDto.External {
        logger.info { "Admin $adminId creating external media: ${request.title}" }

        val media = ExternalMedia().apply {
            this.mediaType = request.mediaType
            this.platform = request.platform
            this.externalId = request.externalId
            this.url = request.url
            this.thumbnailUrl = ExternalMedia.normalizeThumbnailUrl(request.thumbnailUrl)
            this.title = request.title
            this.description = request.description
            this.author = request.author
            this.category = request.category
            this.displayOrder = request.displayOrder
            this.status = GalleryMediaStatus.ACTIVE
            this.curatedBy = adminId
            if (!request.author.isNullOrBlank()) {
                val parsed = CreditParser.parseCredit(request.author)
                this.creditPlatform = parsed.platform
                this.creditHandle = parsed.handle
                this.author = parsed.displayName
            }
        }

        val saved = repository.save(media)
        logger.info { "Created ExternalMedia as ACTIVE: id=${saved.id}" }

        val displayName = userProfileQueryService.findDisplayName(adminId)

        return GalleryMediaDto.from(saved, displayName)
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
        if (!aiFeatureConfigService.isOperational("gallery")) {
            throw BusinessException("AI image analysis is disabled for gallery")
        }
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
                locationContext = userMedia.locationName,
                category = userMedia.category,
                approximateDate = userMedia.approximateDate,
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
        if (!aiFeatureConfigService.isOperational("gallery")) {
            throw BusinessException("AI image analysis is disabled for gallery")
        }
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
            if (media.status !in ANALYSIS_ELIGIBLE_STATUSES) {
                errors.add(BatchError(id, "Media is not ACTIVE or PENDING_REVIEW"))
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
                    locationContext = media.locationName,
                    category = media.category,
                    approximateDate = media.approximateDate,
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

    /**
     * Applies EXIF metadata updates to a UserUploadedMedia record.
     *
     * Validates the media is a UserUploadedMedia, writes an audit row
     * with action "EXIF_UPDATE", and applies only non-null fields from the request.
     *
     * @param mediaId UUID of the media item
     * @param adminId UUID of the admin performing the update
     * @param request EXIF fields to apply (PATCH semantics)
     * @return Updated media DTO, or null if not found
     * @throws BusinessException if media is not UserUploadedMedia
     */
    @Transactional
    fun applyExifUpdate(
        mediaId: UUID,
        adminId: UUID,
        request: UpdateExifRequest,
    ): GalleryMediaDto? {
        val media = repository.findById(mediaId).orElse(null) ?: return null

        if (media !is UserUploadedMedia) {
            throw BusinessException("EXIF update is only supported for user-uploaded media")
        }

        request.latitude?.let { media.latitude = BigDecimal.valueOf(it) }
        request.longitude?.let { media.longitude = BigDecimal.valueOf(it) }
        request.altitude?.let { media.altitude = BigDecimal.valueOf(it) }
        request.dateTaken?.let { media.dateTaken = it }
        request.cameraMake?.let { media.cameraMake = it }
        request.cameraModel?.let { media.cameraModel = it }
        request.orientation?.let { media.orientation = it }
        request.width?.let { media.width = it }
        request.height?.let { media.height = it }
        request.photoType?.let { media.photoType = it }
        request.gpsPrivacyLevel?.let { media.gpsPrivacyLevel = it }

        media.reviewedBy = adminId
        media.reviewedAt = Instant.now()

        val saved = repository.save(media)

        val audit = MediaModerationAudit(
            mediaId = mediaId,
            action = "EXIF_UPDATE",
            previousStatus = media.status.name,
            newStatus = media.status.name,
            reason = "EXIF metadata re-extracted and applied by admin",
        )
        auditRepository.save(audit)

        logger.info { "EXIF metadata updated for media $mediaId by admin $adminId" }

        val displayNames = resolveDisplayNames(listOf(saved))
        return saved.toDto(displayNames)
    }

    private fun resolveDisplayNames(mediaList: List<GalleryMedia>): Map<UUID, String> {
        val userIds = mediaList.contributorIds()
        return if (userIds.isNotEmpty()) userProfileQueryService.findDisplayNames(userIds) else emptyMap()
    }

    private fun validateMediaForAnalysis(media: GalleryMedia) {
        if (media !is UserUploadedMedia) {
            throw BusinessException("Only user uploads can be analyzed by AI")
        }
        if (media.status !in ANALYSIS_ELIGIBLE_STATUSES) {
            throw BusinessException("Media must be ACTIVE or PENDING_REVIEW for AI analysis (current: ${media.status})")
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
