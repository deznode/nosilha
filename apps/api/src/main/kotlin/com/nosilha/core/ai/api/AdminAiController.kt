package com.nosilha.core.ai.api

import com.nosilha.core.ai.api.dto.AnalysisRunDetailDto
import com.nosilha.core.ai.api.dto.AnalysisRunSummaryDto
import com.nosilha.core.ai.api.dto.ApproveEditedRequest
import com.nosilha.core.ai.api.dto.BatchSummaryDto
import com.nosilha.core.ai.api.dto.RejectRequest
import com.nosilha.core.ai.domain.AiModerationService
import com.nosilha.core.ai.domain.ApiUsageService
import com.nosilha.core.ai.domain.ImageAnalysisProvider
import com.nosilha.core.ai.domain.ModerationStatus
import com.nosilha.core.ai.repository.AnalysisBatchRepository
import com.nosilha.core.ai.repository.AnalysisRunRepository
import com.nosilha.core.shared.api.ApiResult
import com.nosilha.core.shared.api.PageableInfo
import com.nosilha.core.shared.api.PagedApiResult
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
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
    /**
     * List analysis runs pending moderator review.
     */
    @GetMapping("/review-queue")
    fun getReviewQueue(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): PagedApiResult<AnalysisRunSummaryDto> {
        val pageable = PageRequest.of(page, minOf(size, 100))
        val runsPage = moderationService.getReviewQueue(pageable)

        val dtos = runsPage.content.map { AnalysisRunSummaryDto.from(it) }

        return PagedApiResult(
            data = dtos,
            pageable = PageableInfo(
                page = runsPage.number,
                size = runsPage.size,
                totalElements = runsPage.totalElements,
                totalPages = runsPage.totalPages,
                first = runsPage.isFirst,
                last = runsPage.isLast,
            ),
        )
    }

    /**
     * Get detailed AI output for a specific analysis run.
     */
    @GetMapping("/review/{runId}")
    fun getRunDetail(
        @PathVariable runId: UUID,
    ): ResponseEntity<ApiResult<AnalysisRunDetailDto>> {
        val run = moderationService.getRunDetail(runId)
        return ResponseEntity.ok(ApiResult(data = AnalysisRunDetailDto.from(run)))
    }

    /**
     * Approve AI results — applies them to the gallery media entity.
     */
    @PostMapping("/review/{runId}/approve")
    fun approveRun(
        @PathVariable runId: UUID,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<Unit>> {
        val adminId = UUID.fromString(authentication.name)
        logger.info { "Admin $adminId approving AI run $runId" }
        moderationService.approve(runId, adminId)
        return ResponseEntity.ok(ApiResult(data = Unit))
    }

    /**
     * Reject AI results — discards them without applying.
     */
    @PostMapping("/review/{runId}/reject")
    fun rejectRun(
        @PathVariable runId: UUID,
        @RequestBody(required = false) request: RejectRequest?,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<Unit>> {
        val adminId = UUID.fromString(authentication.name)
        logger.info { "Admin $adminId rejecting AI run $runId" }
        moderationService.reject(runId, adminId, request?.notes)
        return ResponseEntity.ok(ApiResult(data = Unit))
    }

    /**
     * Approve with edits — applies admin-modified results to the entity.
     */
    @PostMapping("/review/{runId}/approve-edited")
    fun approveEditedRun(
        @PathVariable runId: UUID,
        @RequestBody request: ApproveEditedRequest,
        authentication: Authentication,
    ): ResponseEntity<ApiResult<Unit>> {
        val adminId = UUID.fromString(authentication.name)
        logger.info { "Admin $adminId approving AI run $runId with edits" }
        moderationService.approveEdited(
            runId = runId,
            moderatorId = adminId,
            editedAltText = request.altText,
            editedDescription = request.description,
            editedTags = request.tags,
            notes = request.notes,
        )
        return ResponseEntity.ok(ApiResult(data = Unit))
    }

    /**
     * Get AI processing status for given media items.
     */
    @GetMapping("/status")
    fun getAiStatus(
        @RequestParam mediaIds: List<UUID>,
    ): ResponseEntity<ApiResult<List<AiStatusResponse>>> {
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

        return ResponseEntity.ok(ApiResult(data = statuses))
    }

    /**
     * List all analysis batches with progress info.
     */
    @GetMapping("/batches")
    fun listBatches(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): PagedApiResult<BatchSummaryDto> {
        val pageable = PageRequest.of(page, minOf(size, 100))
        val batchPage = analysisBatchRepository.findAllByOrderByCreatedAtDesc(pageable)

        return PagedApiResult(
            data = batchPage.content.map { BatchSummaryDto.from(it) },
            pageable = PageableInfo(
                page = batchPage.number,
                size = batchPage.size,
                totalElements = batchPage.totalElements,
                totalPages = batchPage.totalPages,
                first = batchPage.isFirst,
                last = batchPage.isLast,
            ),
        )
    }

    /**
     * Get batch detail with per-item status.
     */
    @GetMapping("/batches/{batchId}")
    fun getBatchDetail(
        @PathVariable batchId: UUID,
    ): ResponseEntity<ApiResult<Map<String, Any>>> {
        val batch = analysisBatchRepository.findById(batchId).orElse(null)
            ?: return ResponseEntity.notFound().build()

        val runs = analysisRunRepository.findByBatchId(batchId)

        return ResponseEntity.ok(
            ApiResult(
                data = mapOf(
                    "batch" to BatchSummaryDto.from(batch),
                    "items" to runs.map { AnalysisRunSummaryDto.from(it) },
                ),
            ),
        )
    }

    /**
     * AI provider health and usage statistics.
     */
    @GetMapping("/health")
    fun getAiHealth(): ResponseEntity<ApiResult<AiHealthResponse>> {
        val providerInfos = providers.map { provider ->
            val monthlyLimit = when (provider.name) {
                "cloud-vision" -> cloudVisionMonthlyLimit
                "gemini-cultural" -> geminiMonthlyLimit
                else -> 0
            }
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

        val response = AiHealthResponse(
            enabled = aiEnabled,
            providers = providerInfos,
        )

        return ResponseEntity.ok(ApiResult(data = response))
    }
}

data class AiHealthResponse(
    val enabled: Boolean,
    val providers: List<ProviderHealthDto>,
)

data class ProviderHealthDto(
    val name: String,
    val enabled: Boolean,
    val capabilities: List<String>,
    val usage: UsageDto,
)

data class UsageDto(
    val count: Int,
    val limit: Int,
    val percentUsed: Double,
)

data class AiStatusResponse(
    val mediaId: UUID,
    val lastRunStatus: String?,
    val moderationStatus: String?,
    val aiProcessed: Boolean,
    val aiProcessedAt: java.time.Instant?,
)
