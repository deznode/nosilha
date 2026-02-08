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
import org.springframework.modulith.events.ApplicationModuleListener
import org.springframework.stereotype.Service
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
    @ApplicationModuleListener
    fun onMediaAnalysisBatchRequested(event: MediaAnalysisBatchRequestedEvent) {
        logger.info { "Creating analysis batch ${event.batchId} with ${event.totalItems} items" }

        val batch = AnalysisBatch(
            totalItems = event.totalItems,
            requestedBy = event.requestedBy,
        )
        batch.id = event.batchId
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
            ).also { it.id = event.analysisRunId }
        }
        run.status = AnalysisRunStatus.PROCESSING
        run.startedAt = Instant.now()
        analysisRunRepository.save(run)

        val request = ImageAnalysisRequest(
            mediaId = event.mediaId,
            imageUrl = event.imageUrl,
            culturalContext = event.mediaTitle,
        )

        val results = mutableListOf<ImageAnalysisResult>()
        val usedProviders = mutableListOf<String>()
        var lastError: String? = null

        // Run Cloud Vision first (provides context for Gemini)
        val visionProvider = providers.find { it.name == "cloud-vision" }
        var visionResult: ImageAnalysisResult? = null

        if (visionProvider != null && visionProvider.isEnabled()) {
            if (apiUsageService.checkQuota(visionProvider.name, cloudVisionMonthlyLimit)) {
                try {
                    visionResult = visionProvider.analyze(request)
                    results.add(visionResult)
                    usedProviders.add(visionProvider.name)
                    apiUsageService.incrementUsage(visionProvider.name, cloudVisionMonthlyLimit)
                } catch (e: Exception) {
                    logger.error(e) { "Cloud Vision failed for media ${event.mediaId}" }
                    lastError = "Cloud Vision: ${e.message}"
                }
            } else {
                logger.warn { "Cloud Vision quota exceeded, skipping" }
            }
        }

        // Run Gemini with Cloud Vision results as context
        val geminiProvider = providers.find { it.name == "gemini-cultural" }

        if (geminiProvider != null && geminiProvider.isEnabled()) {
            if (apiUsageService.checkQuota(geminiProvider.name, geminiMonthlyLimit)) {
                try {
                    val geminiRequest = request.copy(priorResults = visionResult)
                    val geminiResult = geminiProvider.analyze(geminiRequest)
                    results.add(geminiResult)
                    usedProviders.add(geminiProvider.name)
                    apiUsageService.incrementUsage(geminiProvider.name, geminiMonthlyLimit)
                } catch (e: Exception) {
                    logger.error(e) { "Gemini failed for media ${event.mediaId}" }
                    lastError = (lastError?.plus("; ") ?: "") + "Gemini: ${e.message}"
                }
            } else {
                logger.warn { "Gemini quota exceeded, skipping" }
            }
        }

        if (results.isEmpty()) {
            // Both providers failed
            run.status = AnalysisRunStatus.FAILED
            run.errorMessage = lastError ?: "All providers failed or unavailable"
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

        // Merge results from all providers
        val merged = mergeResults(results)

        run.status = AnalysisRunStatus.COMPLETED
        run.providersUsed = usedProviders.toTypedArray()
        run.rawResults = buildRawResultsJson(results)
        run.resultTags = merged.tags.toTypedArray().ifEmpty { null }
        run.resultLabels = merged.labels.takeIf { it.isNotEmpty() }?.let { labels ->
            "[${labels.joinToString(",") { """{"label":"${it.label}","confidence":${it.confidence}}""" }}]"
        }
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

    private fun mergeResults(results: List<ImageAnalysisResult>): ImageAnalysisResult {
        val allLabels = results.flatMap { it.labels }.distinctBy { it.label }
        val allText = results.flatMap { it.textDetected }.distinct()
        val allLandmarks = results.flatMap { it.landmarks }.distinct()
        val allTags = results.flatMap { it.tags }.distinct()

        // Prefer Gemini's alt text and description (culturally enriched)
        val altText = results.lastOrNull { it.altText != null }?.altText
        val description = results.lastOrNull { it.description != null }?.description

        return ImageAnalysisResult(
            provider = "merged",
            labels = allLabels,
            textDetected = allText,
            landmarks = allLandmarks,
            altText = altText,
            description = description,
            tags = allTags,
        )
    }

    private fun buildRawResultsJson(results: List<ImageAnalysisResult>): String {
        val entries = results.joinToString(",") { result ->
            """"${result.provider}":${result.rawJson ?: "null"}"""
        }
        return "{$entries}"
    }

    private fun updateBatchProgress(
        batchId: UUID?,
        failed: Boolean
    ) {
        if (batchId == null) return
        val batch = analysisBatchRepository.findById(batchId).orElse(null) ?: return

        if (failed) {
            batch.failedItems += 1
        } else {
            batch.completedItems += 1
        }

        val totalProcessed = batch.completedItems + batch.failedItems
        if (totalProcessed >= batch.totalItems) {
            batch.completedAt = Instant.now()
            batch.status = when {
                batch.failedItems == 0 -> BatchStatus.COMPLETED
                batch.completedItems == 0 -> BatchStatus.FAILED
                else -> BatchStatus.PARTIALLY_COMPLETED
            }
        } else if (batch.status == BatchStatus.PENDING) {
            batch.status = BatchStatus.PROCESSING
        }

        analysisBatchRepository.save(batch)
    }
}
