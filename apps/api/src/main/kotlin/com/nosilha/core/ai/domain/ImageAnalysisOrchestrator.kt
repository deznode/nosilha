package com.nosilha.core.ai.domain

import com.nosilha.core.ai.repository.AnalysisBatchRepository
import com.nosilha.core.ai.repository.AnalysisRunRepository
import com.nosilha.core.shared.events.MediaAnalysisBatchRequestedEvent
import com.nosilha.core.shared.events.MediaAnalysisCompletedEvent
import com.nosilha.core.shared.events.MediaAnalysisFailedEvent
import com.nosilha.core.shared.events.MediaAnalysisRequestedEvent
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.ApplicationEventPublisher
import org.springframework.context.annotation.Lazy
import org.springframework.modulith.events.ApplicationModuleListener
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import tools.jackson.module.kotlin.jacksonObjectMapper
import java.time.Instant
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * Orchestrates AI image analysis across multiple providers.
 *
 * Listens for [MediaAnalysisRequestedEvent], checks API quotas,
 * coordinates provider execution, writes results to the analysis log,
 * and publishes completion/failure events.
 *
 * Results are stored with moderation_status = PENDING_REVIEW and are
 * NOT automatically applied to gallery media entities.
 */
@Service
@Lazy(false) // Must be eager — holds @ApplicationModuleListener (pure event sink, not injected by controllers)
class ImageAnalysisOrchestrator(
    private val providers: List<ImageAnalysisProvider>,
    private val analysisRunRepository: AnalysisRunRepository,
    private val analysisBatchRepository: AnalysisBatchRepository,
    private val apiUsageService: ApiUsageService,
    private val eventPublisher: ApplicationEventPublisher,
    @Value("\${nosilha.ai.cloud-vision.monthly-limit:1000}")
    private val cloudVisionMonthlyLimit: Int,
    @Value("\${nosilha.ai.gemini.monthly-limit:500}")
    private val geminiMonthlyLimit: Int,
) {
    private val objectMapper = jacksonObjectMapper()

    @ApplicationModuleListener
    fun onMediaAnalysisBatchRequested(event: MediaAnalysisBatchRequestedEvent) {
        logger.info { "Creating analysis batch ${event.batchId} with ${event.totalItems} items" }

        val batch = AnalysisBatch(
            totalItems = event.totalItems,
            requestedBy = event.requestedBy,
        )
        batch.assignId(event.batchId)
        analysisBatchRepository.save(batch)
    }

    @ApplicationModuleListener
    fun onMediaAnalysisRequested(event: MediaAnalysisRequestedEvent) {
        logger.info { "Processing analysis request for media ${event.mediaId}, run ${event.analysisRunId}" }

        val run = analysisRunRepository.findById(event.analysisRunId).orElseGet {
            AnalysisRun(
                mediaId = event.mediaId,
                requestedBy = event.requestedBy,
                batchId = event.batchId,
            ).also { it.assignId(event.analysisRunId) }
        }
        run.status = AnalysisRunStatus.PROCESSING
        run.startedAt = Instant.now()
        analysisRunRepository.save(run)

        val request = ImageAnalysisRequest(
            mediaId = event.mediaId,
            imageUrl = event.imageUrl,
            culturalContext = event.mediaTitle,
            locationContext = event.locationContext,
            category = event.category,
            approximateDate = event.approximateDate,
        )

        val errors = mutableListOf<String>()

        val visionResult = executeProvider("cloud-vision", request, cloudVisionMonthlyLimit, errors)

        val geminiRequest = request.copy(priorResults = visionResult)
        val geminiResult = executeProvider("gemini-cultural", geminiRequest, geminiMonthlyLimit, errors)

        val results = listOfNotNull(visionResult, geminiResult)
        val usedProviders = results.map { it.provider }

        if (results.isEmpty()) {
            run.status = AnalysisRunStatus.FAILED
            run.errorMessage = errors.joinToString("; ").ifEmpty { "All providers failed or unavailable" }
            run.completedAt = Instant.now()
            analysisRunRepository.save(run)

            updateBatchProgress(event.batchId, failed = true)

            eventPublisher.publishEvent(
                MediaAnalysisFailedEvent(
                    mediaId = event.mediaId,
                    analysisRunId = event.analysisRunId,
                    errorMessage = run.errorMessage!!,
                ),
            )
            return
        }

        val merged = mergeResults(results)

        run.status = AnalysisRunStatus.COMPLETED
        run.providersUsed = usedProviders.toTypedArray()
        run.rawResults = buildRawResultsJson(results)
        run.resultTags = merged.tags.takeIf { it.isNotEmpty() }?.toTypedArray()
        run.resultLabels = merged.labels.takeIf { it.isNotEmpty() }?.let {
            objectMapper.writeValueAsString(it)
        }
        run.resultTitle = merged.title
        run.resultAltText = merged.altText
        run.resultDescription = merged.description
        run.moderationStatus = ModerationStatus.PENDING_REVIEW
        run.completedAt = Instant.now()
        analysisRunRepository.save(run)

        updateBatchProgress(event.batchId, failed = false)

        eventPublisher.publishEvent(
            MediaAnalysisCompletedEvent(
                mediaId = event.mediaId,
                analysisRunId = event.analysisRunId,
                tags = merged.tags,
                labels = run.resultLabels,
                title = merged.title,
                altText = merged.altText,
                description = merged.description,
                providers = usedProviders,
            ),
        )

        logger.info {
            "Analysis completed for media ${event.mediaId}: " +
                "${usedProviders.size} providers, ${merged.tags.size} tags, " +
                "alt text: ${merged.altText != null}, description: ${merged.description != null}"
        }
    }

    private fun executeProvider(
        providerName: String,
        request: ImageAnalysisRequest,
        monthlyLimit: Int,
        errors: MutableList<String>,
    ): ImageAnalysisResult? {
        val provider = providers.find { it.name == providerName } ?: return null
        if (!provider.isEnabled()) return null

        if (!apiUsageService.checkAndIncrementQuota(provider.name, monthlyLimit)) {
            logger.warn { "${provider.name} quota exceeded, skipping" }
            return null
        }

        return try {
            provider.analyze(request)
        } catch (e: Exception) {
            logger.error(e) { "${provider.name} failed for media ${request.mediaId}" }
            errors.add("${provider.name}: ${e.message}")
            null
        }
    }

    private fun mergeResults(results: List<ImageAnalysisResult>): ImageAnalysisResult {
        val allLabels = results.flatMap { it.labels }.distinctBy { it.label }
        val allText = results.flatMap { it.textDetected }.distinct()
        val allLandmarks = results.flatMap { it.landmarks }.distinct()
        val allTags = results.flatMap { it.tags }.distinct()

        // Prefer Gemini's results (culturally enriched)
        val title = results.lastOrNull { it.title != null }?.title
        val altText = results.lastOrNull { it.altText != null }?.altText
        val description = results.lastOrNull { it.description != null }?.description

        return ImageAnalysisResult(
            provider = "merged",
            labels = allLabels,
            textDetected = allText,
            landmarks = allLandmarks,
            title = title,
            altText = altText,
            description = description,
            tags = allTags,
        )
    }

    private fun buildRawResultsJson(results: List<ImageAnalysisResult>): String {
        val map = results.associate { result ->
            result.provider to (result.rawJson ?: "null")
        }
        return objectMapper.writeValueAsString(map)
    }

    @Transactional
    fun updateBatchProgress(
        batchId: UUID?,
        failed: Boolean,
    ) {
        if (batchId == null) return
        val rowsUpdated = if (failed) {
            analysisBatchRepository.incrementFailedAndUpdateStatus(batchId)
        } else {
            analysisBatchRepository.incrementCompletedAndUpdateStatus(batchId)
        }
        if (rowsUpdated == 0) {
            logger.warn { "No batch found to update progress for $batchId" }
        }
    }
}
