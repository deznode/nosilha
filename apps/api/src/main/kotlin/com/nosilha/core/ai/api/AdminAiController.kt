package com.nosilha.core.ai.api

import com.nosilha.core.ai.api.dto.AiHealthResponse
import com.nosilha.core.ai.api.dto.AiStatusResponse
import com.nosilha.core.ai.api.dto.AnalysisRunDetailDto
import com.nosilha.core.ai.api.dto.AnalysisRunSummaryDto
import com.nosilha.core.ai.api.dto.ApproveEditedRequest
import com.nosilha.core.ai.api.dto.BatchDetailDto
import com.nosilha.core.ai.api.dto.BatchSummaryDto
import com.nosilha.core.ai.api.dto.ProviderHealthDto
import com.nosilha.core.ai.api.dto.RejectRequest
import com.nosilha.core.ai.api.dto.UsageDto
import com.nosilha.core.ai.domain.AiModerationService
import com.nosilha.core.ai.domain.ApiUsageService
import com.nosilha.core.ai.domain.ImageAnalysisProvider
import com.nosilha.core.ai.domain.ModerationStatus
import com.nosilha.core.ai.repository.AnalysisBatchRepository
import com.nosilha.core.ai.repository.AnalysisRunRepository
import com.nosilha.core.shared.api.ApiResult
import com.nosilha.core.shared.api.PagedApiResult
import com.nosilha.core.shared.exception.ResourceNotFoundException
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.domain.PageRequest
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * Admin REST controller for AI moderation and health monitoring.
 *
 * Endpoints:
 * - GET /review-queue - List AI results pending moderator review
 * - GET /review/{runId} - Get detailed AI output for a run
 * - POST /review/{runId}/approve - Apply AI results to media entity
 * - POST /review/{runId}/reject - Discard AI results
 * - POST /review/{runId}/approve-edited - Apply admin-modified results
 * - GET /health - AI provider health and usage stats
 */
@RestController
@RequestMapping("/api/v1/admin/ai")
@PreAuthorize("hasRole('ADMIN')")
class AdminAiController(
    private val moderationService: AiModerationService,
    private val providers: List<ImageAnalysisProvider>,
    private val apiUsageService: ApiUsageService,
    private val analysisRunRepository: AnalysisRunRepository,
    private val analysisBatchRepository: AnalysisBatchRepository,
    @Value("\${nosilha.ai.enabled:false}")
    private val aiEnabled: Boolean,
    @Value("\${nosilha.ai.cloud-vision.monthly-limit:1000}")
    private val cloudVisionMonthlyLimit: Int,
    @Value("\${nosilha.ai.gemini.monthly-limit:500}")
    private val geminiMonthlyLimit: Int,
) {
    @GetMapping("/review-queue")
    fun getReviewQueue(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): PagedApiResult<AnalysisRunSummaryDto> {
        val pageable = PageRequest.of(page, minOf(size, 100))
        val runsPage = moderationService.getReviewQueue(pageable)
        return PagedApiResult.from(runsPage.map { AnalysisRunSummaryDto.from(it) })
    }

    @GetMapping("/review/{runId}")
    fun getRunDetail(
        @PathVariable runId: UUID,
    ): ApiResult<AnalysisRunDetailDto> {
        val run = moderationService.getRunDetail(runId)
        return ApiResult(data = AnalysisRunDetailDto.from(run))
    }

    @PostMapping("/review/{runId}/approve")
    fun approveRun(
        @PathVariable runId: UUID,
        authentication: Authentication,
    ): ApiResult<Unit> {
        val adminId = UUID.fromString(authentication.name)
        logger.info { "Admin $adminId approving AI run $runId" }
        moderationService.approve(runId, adminId)
        return ApiResult(data = Unit)
    }

    @PostMapping("/review/{runId}/reject")
    fun rejectRun(
        @PathVariable runId: UUID,
        @RequestBody(required = false) request: RejectRequest?,
        authentication: Authentication,
    ): ApiResult<Unit> {
        val adminId = UUID.fromString(authentication.name)
        logger.info { "Admin $adminId rejecting AI run $runId" }
        moderationService.reject(runId, adminId, request?.notes)
        return ApiResult(data = Unit)
    }

    @PostMapping("/review/{runId}/approve-edited")
    fun approveEditedRun(
        @PathVariable runId: UUID,
        @RequestBody request: ApproveEditedRequest,
        authentication: Authentication,
    ): ApiResult<Unit> {
        val adminId = UUID.fromString(authentication.name)
        logger.info { "Admin $adminId approving AI run $runId with edits" }
        moderationService.approveEdited(
            runId = runId,
            moderatorId = adminId,
            editedTitle = request.title,
            editedAltText = request.altText,
            editedDescription = request.description,
            editedTags = request.tags,
            notes = request.notes,
        )
        return ApiResult(data = Unit)
    }

    @GetMapping("/status")
    fun getAiStatus(
        @RequestParam mediaIds: List<UUID>,
    ): ApiResult<List<AiStatusResponse>> {
        val statuses = mediaIds.map { mediaId ->
            val lastRun = analysisRunRepository.findTopByMediaIdOrderByCreatedAtDesc(mediaId)

            AiStatusResponse(
                mediaId = mediaId,
                lastRunStatus = lastRun?.status?.name,
                moderationStatus = lastRun?.moderationStatus?.name,
                aiProcessed = lastRun?.moderationStatus == ModerationStatus.APPROVED,
                aiProcessedAt = lastRun?.moderatedAt,
            )
        }

        return ApiResult(data = statuses)
    }

    @GetMapping("/batches")
    fun listBatches(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): PagedApiResult<BatchSummaryDto> {
        val pageable = PageRequest.of(page, minOf(size, 100))
        val batchPage = analysisBatchRepository.findAllByOrderByCreatedAtDesc(pageable)
        return PagedApiResult.from(batchPage.map { BatchSummaryDto.from(it) })
    }

    @GetMapping("/batches/{batchId}")
    fun getBatchDetail(
        @PathVariable batchId: UUID,
    ): ApiResult<BatchDetailDto> {
        val batch = analysisBatchRepository.findById(batchId).orElseThrow {
            ResourceNotFoundException("Analysis batch with ID '$batchId' not found.")
        }

        val runs = analysisRunRepository.findByBatchId(batchId)

        return ApiResult(
            data = BatchDetailDto(
                batch = BatchSummaryDto.from(batch),
                items = runs.map { AnalysisRunSummaryDto.from(it) },
            ),
        )
    }

    @GetMapping("/health")
    fun getAiHealth(): ApiResult<AiHealthResponse> {
        val monthlyLimits = mapOf(
            "cloud-vision" to cloudVisionMonthlyLimit,
            "gemini-cultural" to geminiMonthlyLimit,
        )

        val providerInfos = providers.map { provider ->
            val monthlyLimit = monthlyLimits[provider.name] ?: 0
            val usage = apiUsageService.getUsage(provider.name, monthlyLimit)

            ProviderHealthDto(
                name = provider.name,
                enabled = provider.isEnabled(),
                capabilities = provider.supports().map { it.name },
                usage = UsageDto(
                    count = usage.count,
                    limit = usage.limit,
                    percentUsed = usage.percentUsed,
                ),
            )
        }

        return ApiResult(
            data = AiHealthResponse(
                enabled = aiEnabled,
                providers = providerInfos,
            ),
        )
    }
}
