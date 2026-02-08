package com.nosilha.core.ai.api.dto

import com.nosilha.core.ai.domain.AnalysisBatch
import com.nosilha.core.ai.domain.AnalysisRun
import com.nosilha.core.ai.domain.AnalysisRunStatus
import com.nosilha.core.ai.domain.BatchStatus
import com.nosilha.core.ai.domain.ModerationStatus
import java.time.Instant
import java.time.LocalDateTime
import java.util.UUID

/**
 * Summary view of an analysis run for the review queue.
 */
data class AnalysisRunSummaryDto(
    val id: UUID,
    val mediaId: UUID,
    val status: AnalysisRunStatus,
    val moderationStatus: ModerationStatus,
    val providersUsed: List<String>,
    val resultTags: List<String>,
    val resultAltText: String?,
    val resultDescription: String?,
    val createdAt: LocalDateTime,
    val completedAt: Instant?,
) {
    companion object {
        fun from(run: AnalysisRun) =
            AnalysisRunSummaryDto(
                id = run.id!!,
                mediaId = run.mediaId,
                status = run.status,
                moderationStatus = run.moderationStatus,
                providersUsed = run.providersUsed?.toList() ?: emptyList(),
                resultTags = run.resultTags?.toList() ?: emptyList(),
                resultAltText = run.resultAltText,
                resultDescription = run.resultDescription,
                createdAt = run.createdAt,
                completedAt = run.completedAt,
            )
    }
}

/**
 * Detailed view of an analysis run for moderator review.
 */
data class AnalysisRunDetailDto(
    val id: UUID,
    val mediaId: UUID,
    val batchId: UUID?,
    val status: AnalysisRunStatus,
    val moderationStatus: ModerationStatus,
    val providersUsed: List<String>,
    val rawResults: String?,
    val resultTags: List<String>,
    val resultLabels: String?,
    val resultAltText: String?,
    val resultDescription: String?,
    val moderatedBy: UUID?,
    val moderatedAt: Instant?,
    val moderatorNotes: String?,
    val errorMessage: String?,
    val requestedBy: UUID,
    val startedAt: Instant?,
    val completedAt: Instant?,
    val createdAt: LocalDateTime,
) {
    companion object {
        fun from(run: AnalysisRun) =
            AnalysisRunDetailDto(
                id = run.id!!,
                mediaId = run.mediaId,
                batchId = run.batchId,
                status = run.status,
                moderationStatus = run.moderationStatus,
                providersUsed = run.providersUsed?.toList() ?: emptyList(),
                rawResults = run.rawResults,
                resultTags = run.resultTags?.toList() ?: emptyList(),
                resultLabels = run.resultLabels,
                resultAltText = run.resultAltText,
                resultDescription = run.resultDescription,
                moderatedBy = run.moderatedBy,
                moderatedAt = run.moderatedAt,
                moderatorNotes = run.moderatorNotes,
                errorMessage = run.errorMessage,
                requestedBy = run.requestedBy,
                startedAt = run.startedAt,
                completedAt = run.completedAt,
                createdAt = run.createdAt,
            )
    }
}

/**
 * Request body for approving AI results with admin edits.
 */
data class ApproveEditedRequest(
    val altText: String? = null,
    val description: String? = null,
    val tags: List<String>? = null,
    val notes: String? = null,
)

/**
 * Request body for rejecting AI results.
 */
data class RejectRequest(
    val notes: String? = null,
)

/**
 * Batch summary DTO.
 */
data class BatchSummaryDto(
    val id: UUID,
    val status: BatchStatus,
    val totalItems: Int,
    val completedItems: Int,
    val failedItems: Int,
    val requestedBy: UUID,
    val startedAt: Instant?,
    val completedAt: Instant?,
    val createdAt: LocalDateTime,
) {
    companion object {
        fun from(batch: AnalysisBatch) =
            BatchSummaryDto(
                id = batch.id!!,
                status = batch.status,
                totalItems = batch.totalItems,
                completedItems = batch.completedItems,
                failedItems = batch.failedItems,
                requestedBy = batch.requestedBy,
                startedAt = batch.startedAt,
                completedAt = batch.completedAt,
                createdAt = batch.createdAt,
            )
    }
}

/**
 * AI system health and provider status.
 */
data class AiHealthResponse(
    val enabled: Boolean,
    val providers: List<ProviderHealthDto>,
)

/**
 * Health and usage stats for a single AI provider.
 */
data class ProviderHealthDto(
    val name: String,
    val enabled: Boolean,
    val capabilities: List<String>,
    val usage: UsageDto,
)

/**
 * Current API usage stats for a provider.
 */
data class UsageDto(
    val count: Int,
    val limit: Int,
    val percentUsed: Double,
)

/**
 * AI processing status for a gallery media item.
 */
data class AiStatusResponse(
    val mediaId: UUID,
    val lastRunStatus: String?,
    val moderationStatus: String?,
    val aiProcessed: Boolean,
    val aiProcessedAt: Instant?,
)
