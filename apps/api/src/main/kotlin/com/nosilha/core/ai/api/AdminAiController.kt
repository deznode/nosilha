package com.nosilha.core.ai.api

import com.nosilha.core.ai.api.dto.AiHealthResponse
import com.nosilha.core.ai.api.dto.AiStatusResponse
import com.nosilha.core.ai.api.dto.AnalysisRunDetailDto
import com.nosilha.core.ai.api.dto.AnalysisRunSummaryDto
import com.nosilha.core.ai.api.dto.ApproveEditedRequest
import com.nosilha.core.ai.api.dto.BatchDetailDto
import com.nosilha.core.ai.api.dto.BatchSummaryDto
import com.nosilha.core.ai.api.dto.DomainConfigDto
import com.nosilha.core.ai.api.dto.ProviderHealthDto
import com.nosilha.core.ai.api.dto.RejectRequest
import com.nosilha.core.ai.api.dto.UpdateDomainConfigRequest
import com.nosilha.core.ai.api.dto.UsageDto
import com.nosilha.core.ai.domain.AiFeatureConfigService
import com.nosilha.core.ai.domain.AiModerationService
import com.nosilha.core.ai.domain.AiProvider
import com.nosilha.core.ai.domain.ApiUsageService
import com.nosilha.core.ai.domain.ModerationStatus
import com.nosilha.core.ai.repository.AnalysisBatchRepository
import com.nosilha.core.ai.repository.AnalysisRunRepository
import com.nosilha.core.shared.api.ApiResult
import com.nosilha.core.shared.api.PagedApiResult
import com.nosilha.core.shared.exception.ResourceNotFoundException
import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.validation.Valid
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

private val logger = KotlinLogging.logger {}

private fun Authentication.adminId(): UUID = UUID.fromString(name)

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
    private val configService: AiFeatureConfigService,
    private val providers: List<AiProvider>,
    private val apiUsageService: ApiUsageService,
    private val analysisRunRepository: AnalysisRunRepository,
    private val analysisBatchRepository: AnalysisBatchRepository,
) {
    @GetMapping("/review-queue")
    fun getReviewQueue(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) moderationStatus: ModerationStatus?,
    ): PagedApiResult<AnalysisRunSummaryDto> {
        val pageable = PageRequest.of(page, minOf(size, 100), Sort.by(Sort.Direction.DESC, "createdAt"))
        val runsPage = moderationService.getReviewQueue(pageable, moderationStatus)
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
        val adminId = authentication.adminId()
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
        val adminId = authentication.adminId()
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
        val adminId = authentication.adminId()
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
        if (mediaIds.isEmpty()) {
            return ApiResult(data = emptyList())
        }
        val latestRuns = analysisRunRepository.findLatestByMediaIds(mediaIds)
        val runsByMediaId = latestRuns.associateBy { it.mediaId }
        val statuses = mediaIds.map { mediaId ->
            val lastRun = runsByMediaId[mediaId]

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
        val providerInfos = providers.map { provider ->
            val usage = apiUsageService.getUsage(provider.name, provider.monthlyLimit)

            ProviderHealthDto(
                name = provider.name,
                enabled = provider.isEnabled(),
                capabilities = provider.capabilities().toList(),
                usage = UsageDto(
                    count = usage.count,
                    limit = usage.limit,
                    percentUsed = usage.percentUsed,
                ),
            )
        }

        val domains = configService.getDomainConfigs().map { DomainConfigDto.from(it) }

        return ApiResult(
            data = AiHealthResponse(
                enabled = configService.isGloballyEnabled(),
                providers = providerInfos,
                domains = domains,
            ),
        )
    }

    @GetMapping("/config")
    fun getConfigs(): ApiResult<List<DomainConfigDto>> {
        val configs = configService.getAllConfigs().map { DomainConfigDto.from(it) }
        return ApiResult(data = configs)
    }

    @PutMapping("/config/{domain}")
    fun updateConfig(
        @PathVariable domain: String,
        @Valid @RequestBody request: UpdateDomainConfigRequest,
        authentication: Authentication,
    ): ApiResult<DomainConfigDto> {
        val adminId = authentication.adminId()
        val updated = configService.updateConfig(domain, request.enabled, adminId)
        return ApiResult(data = DomainConfigDto.from(updated))
    }
}
