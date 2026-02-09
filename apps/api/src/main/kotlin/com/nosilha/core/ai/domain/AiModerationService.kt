package com.nosilha.core.ai.domain

import com.nosilha.core.ai.repository.AnalysisRunRepository
import com.nosilha.core.shared.events.AiResultsApprovedEvent
import com.nosilha.core.shared.exception.BusinessException
import com.nosilha.core.shared.exception.ResourceNotFoundException
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * Service for the AI content moderation workflow.
 *
 * Handles reviewing AI-generated results before they are applied to gallery media.
 * Supports approve (publish event), reject (discard), and approve-edited (publish modified results).
 *
 * On approval, publishes [AiResultsApprovedEvent] which the gallery module consumes
 * to apply AI fields to the media entity. This maintains Spring Modulith module boundaries.
 */
@Service
class AiModerationService(
    private val analysisRunRepository: AnalysisRunRepository,
    private val eventPublisher: ApplicationEventPublisher,
) {
    /**
     * Lists analysis runs pending moderator review.
     */
    @Transactional(readOnly = true)
    fun getReviewQueue(pageable: Pageable): Page<AnalysisRun> =
        analysisRunRepository.findByModerationStatus(ModerationStatus.PENDING_REVIEW, pageable)

    /**
     * Gets detailed view of an analysis run for moderator review.
     */
    @Transactional(readOnly = true)
    fun getRunDetail(runId: UUID): AnalysisRun =
        analysisRunRepository.findById(runId).orElseThrow {
            ResourceNotFoundException("Analysis run not found: $runId")
        }

    /**
     * Approves AI results and publishes [AiResultsApprovedEvent] for the gallery module.
     *
     * This is the safety gate: AI fields are only written to UserUploadedMedia
     * after explicit moderator approval via event-driven cross-module communication.
     */
    @Transactional
    fun approve(
        runId: UUID,
        moderatorId: UUID,
        notes: String? = null,
    ) {
        val run = getAndValidateRun(runId)

        run.moderationStatus = ModerationStatus.APPROVED
        run.moderatedBy = moderatorId
        run.moderatedAt = Instant.now()
        run.moderatorNotes = notes
        analysisRunRepository.save(run)

        eventPublisher.publishEvent(
            AiResultsApprovedEvent(
                mediaId = run.mediaId,
                analysisRunId = run.id!!,
                altText = run.resultAltText,
                description = run.resultDescription,
                tags = run.resultTags?.toList() ?: emptyList(),
                labels = run.resultLabels,
                moderatorId = moderatorId,
            ),
        )

        logger.info { "AI results approved for media ${run.mediaId}, run $runId, by moderator $moderatorId" }
    }

    /** Rejects AI results without applying them. */
    @Transactional
    fun reject(
        runId: UUID,
        moderatorId: UUID,
        notes: String? = null,
    ) {
        val run = getAndValidateRun(runId)

        run.moderationStatus = ModerationStatus.REJECTED
        run.moderatedBy = moderatorId
        run.moderatedAt = Instant.now()
        run.moderatorNotes = notes
        analysisRunRepository.save(run)

        logger.info { "AI results rejected for media ${run.mediaId}, run $runId, by moderator $moderatorId" }
    }

    /**
     * Approves AI results with admin edits, publishing modified values for the gallery module.
     *
     * Edited fields override original AI output; unedited fields fall back to originals.
     * Both the original (rawResults) and final values are preserved.
     */
    @Transactional
    fun approveEdited(
        runId: UUID,
        moderatorId: UUID,
        editedAltText: String?,
        editedDescription: String?,
        editedTags: List<String>?,
        notes: String? = null,
    ) {
        val run = getAndValidateRun(runId)

        val finalAltText = editedAltText ?: run.resultAltText
        val finalDescription = editedDescription ?: run.resultDescription
        val finalTags = editedTags ?: run.resultTags?.toList() ?: emptyList()

        run.resultAltText = finalAltText
        run.resultDescription = finalDescription
        run.resultTags = finalTags.toTypedArray().ifEmpty { null }
        run.moderationStatus = ModerationStatus.APPROVED
        run.moderatedBy = moderatorId
        run.moderatedAt = Instant.now()
        run.moderatorNotes = notes ?: "Approved with edits"
        analysisRunRepository.save(run)

        eventPublisher.publishEvent(
            AiResultsApprovedEvent(
                mediaId = run.mediaId,
                analysisRunId = run.id!!,
                altText = finalAltText,
                description = finalDescription,
                tags = finalTags,
                labels = run.resultLabels,
                moderatorId = moderatorId,
            ),
        )

        logger.info { "AI results approved with edits for media ${run.mediaId}, run $runId, by moderator $moderatorId" }
    }

    private fun getAndValidateRun(runId: UUID): AnalysisRun {
        val run = analysisRunRepository.findById(runId).orElseThrow {
            ResourceNotFoundException("Analysis run not found: $runId")
        }

        if (run.moderationStatus != ModerationStatus.PENDING_REVIEW) {
            throw BusinessException(
                "Analysis run $runId has already been moderated (status: ${run.moderationStatus})",
            )
        }

        if (run.status != AnalysisRunStatus.COMPLETED) {
            throw BusinessException(
                "Analysis run $runId is not completed (status: ${run.status})",
            )
        }

        return run
    }
}
