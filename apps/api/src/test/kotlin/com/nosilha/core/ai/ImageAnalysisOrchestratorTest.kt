package com.nosilha.core.ai

import com.nosilha.core.ai.domain.AnalysisRun
import com.nosilha.core.ai.domain.AnalysisRunStatus
import com.nosilha.core.ai.domain.ApiUsageService
import com.nosilha.core.ai.domain.ImageAnalysisOrchestrator
import com.nosilha.core.ai.domain.ImageAnalysisProvider
import com.nosilha.core.ai.domain.ImageAnalysisResult
import com.nosilha.core.ai.domain.LabelResult
import com.nosilha.core.ai.domain.ModerationStatus
import com.nosilha.core.ai.repository.AnalysisBatchRepository
import com.nosilha.core.ai.repository.AnalysisRunRepository
import com.nosilha.core.shared.events.MediaAnalysisCompletedEvent
import com.nosilha.core.shared.events.MediaAnalysisFailedEvent
import com.nosilha.core.shared.events.MediaAnalysisRequestedEvent
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.kotlin.any
import org.mockito.kotlin.capture
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.context.ApplicationEventPublisher
import java.util.Optional
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class ImageAnalysisOrchestratorTest {
    private val visionProvider = mock<ImageAnalysisProvider>()
    private val geminiProvider = mock<ImageAnalysisProvider>()
    private val analysisRunRepository = mock<AnalysisRunRepository>()
    private val analysisBatchRepository = mock<AnalysisBatchRepository>()
    private val apiUsageService = mock<ApiUsageService>()
    private val eventPublisher = mock<ApplicationEventPublisher>()

    private lateinit var orchestrator: ImageAnalysisOrchestrator

    private val mediaId = UUID.randomUUID()
    private val runId = UUID.randomUUID()
    private val adminId = UUID.randomUUID()

    @BeforeEach
    fun setup() {
        whenever(visionProvider.name).thenReturn("cloud-vision")
        whenever(geminiProvider.name).thenReturn("gemini-cultural")
        whenever(visionProvider.isEnabled()).thenReturn(true)
        whenever(geminiProvider.isEnabled()).thenReturn(true)

        orchestrator = ImageAnalysisOrchestrator(
            providers = listOf(visionProvider, geminiProvider),
            analysisRunRepository = analysisRunRepository,
            analysisBatchRepository = analysisBatchRepository,
            apiUsageService = apiUsageService,
            eventPublisher = eventPublisher,
            cloudVisionMonthlyLimit = 1000,
            geminiMonthlyLimit = 500,
        )
    }

    private fun createRun(): AnalysisRun {
        val run = AnalysisRun(mediaId = mediaId, requestedBy = adminId)
        run.id = runId
        return run
    }

    private fun createEvent(): MediaAnalysisRequestedEvent =
        MediaAnalysisRequestedEvent(
            mediaId = mediaId,
            imageUrl = "https://media.nosilha.com/images/test.jpg",
            requestedBy = adminId,
            analysisRunId = runId,
        )

    @Test
    fun `both providers succeed - run completed with merged results`() {
        val run = createRun()
        whenever(analysisRunRepository.findById(runId)).thenReturn(Optional.of(run))
        whenever(analysisRunRepository.save(any<AnalysisRun>())).thenAnswer { it.arguments[0] }
        whenever(apiUsageService.checkAndIncrementQuota(eq("cloud-vision"), eq(1000))).thenReturn(true)
        whenever(apiUsageService.checkAndIncrementQuota(eq("gemini-cultural"), eq(500))).thenReturn(true)

        whenever(visionProvider.analyze(any())).thenReturn(
            ImageAnalysisResult(
                provider = "cloud-vision",
                labels = listOf(LabelResult("church", 0.95f), LabelResult("architecture", 0.87f)),
                landmarks = listOf("Nova Sintra"),
            ),
        )
        whenever(geminiProvider.analyze(any())).thenReturn(
            ImageAnalysisResult(
                provider = "gemini-cultural",
                altText = "Historic church in Nova Sintra",
                description = "A traditional Portuguese colonial church in the center of Nova Sintra, Brava Island",
                tags = listOf("heritage", "architecture", "nova-sintra"),
            ),
        )

        orchestrator.onMediaAnalysisRequested(createEvent())

        assertEquals(AnalysisRunStatus.COMPLETED, run.status)
        assertEquals(ModerationStatus.PENDING_REVIEW, run.moderationStatus)
        assertNotNull(run.resultAltText)
        assertNotNull(run.resultDescription)
        assertNotNull(run.resultTags)
        assertEquals(2, run.providersUsed!!.size)

        val eventCaptor = ArgumentCaptor.forClass(MediaAnalysisCompletedEvent::class.java)
        verify(eventPublisher).publishEvent(capture(eventCaptor))
        assertEquals(mediaId, eventCaptor.value.mediaId)
    }

    @Test
    fun `cloud vision fails, gemini succeeds - partial results`() {
        val run = createRun()
        whenever(analysisRunRepository.findById(runId)).thenReturn(Optional.of(run))
        whenever(analysisRunRepository.save(any<AnalysisRun>())).thenAnswer { it.arguments[0] }
        whenever(apiUsageService.checkAndIncrementQuota(eq("cloud-vision"), eq(1000))).thenReturn(true)
        whenever(apiUsageService.checkAndIncrementQuota(eq("gemini-cultural"), eq(500))).thenReturn(true)

        whenever(visionProvider.analyze(any())).thenThrow(RuntimeException("Cloud Vision API error"))
        whenever(geminiProvider.analyze(any())).thenReturn(
            ImageAnalysisResult(
                provider = "gemini-cultural",
                altText = "A scenic view of Brava Island",
                description = "Panoramic view of the volcanic landscape",
                tags = listOf("landscape", "brava"),
            ),
        )

        orchestrator.onMediaAnalysisRequested(createEvent())

        assertEquals(AnalysisRunStatus.COMPLETED, run.status)
        assertEquals(1, run.providersUsed!!.size)
        assertEquals("gemini-cultural", run.providersUsed!![0])

        verify(visionProvider).analyze(any())
    }

    @Test
    fun `both providers fail - run failed`() {
        val run = createRun()
        whenever(analysisRunRepository.findById(runId)).thenReturn(Optional.of(run))
        whenever(analysisRunRepository.save(any<AnalysisRun>())).thenAnswer { it.arguments[0] }
        whenever(apiUsageService.checkAndIncrementQuota(eq("cloud-vision"), eq(1000))).thenReturn(true)
        whenever(apiUsageService.checkAndIncrementQuota(eq("gemini-cultural"), eq(500))).thenReturn(true)

        whenever(visionProvider.analyze(any())).thenThrow(RuntimeException("Vision error"))
        whenever(geminiProvider.analyze(any())).thenThrow(RuntimeException("Gemini error"))

        orchestrator.onMediaAnalysisRequested(createEvent())

        assertEquals(AnalysisRunStatus.FAILED, run.status)
        assertNotNull(run.errorMessage)

        val eventCaptor = ArgumentCaptor.forClass(MediaAnalysisFailedEvent::class.java)
        verify(eventPublisher).publishEvent(capture(eventCaptor))
        assertEquals(mediaId, eventCaptor.value.mediaId)
    }

    @Test
    fun `quota exceeded - skips provider`() {
        val run = createRun()
        whenever(analysisRunRepository.findById(runId)).thenReturn(Optional.of(run))
        whenever(analysisRunRepository.save(any<AnalysisRun>())).thenAnswer { it.arguments[0] }
        whenever(apiUsageService.checkAndIncrementQuota(eq("cloud-vision"), eq(1000))).thenReturn(false)
        whenever(apiUsageService.checkAndIncrementQuota(eq("gemini-cultural"), eq(500))).thenReturn(true)

        whenever(geminiProvider.analyze(any())).thenReturn(
            ImageAnalysisResult(
                provider = "gemini-cultural",
                altText = "Test alt text",
                tags = listOf("test"),
            ),
        )

        orchestrator.onMediaAnalysisRequested(createEvent())

        assertEquals(AnalysisRunStatus.COMPLETED, run.status)
        assertEquals(1, run.providersUsed!!.size)

        verify(visionProvider, never()).analyze(any())
    }

    @Test
    fun `batch progress updated on completion`() {
        val batchId = UUID.randomUUID()

        val run = createRun()
        run.batchId = batchId
        whenever(analysisRunRepository.findById(runId)).thenReturn(Optional.of(run))
        whenever(analysisRunRepository.save(any<AnalysisRun>())).thenAnswer { it.arguments[0] }
        whenever(analysisBatchRepository.incrementCompletedAndUpdateStatus(batchId)).thenReturn(1)
        whenever(apiUsageService.checkAndIncrementQuota(any(), any())).thenReturn(true)

        whenever(visionProvider.analyze(any())).thenReturn(
            ImageAnalysisResult(provider = "cloud-vision", labels = listOf(LabelResult("test", 0.9f))),
        )
        whenever(geminiProvider.analyze(any())).thenReturn(
            ImageAnalysisResult(provider = "gemini-cultural", altText = "Test"),
        )

        val event = createEvent().copy(batchId = batchId)
        orchestrator.onMediaAnalysisRequested(event)

        verify(analysisBatchRepository).incrementCompletedAndUpdateStatus(batchId)
    }

    @Test
    fun `moderation status is always PENDING_REVIEW`() {
        val run = createRun()
        whenever(analysisRunRepository.findById(runId)).thenReturn(Optional.of(run))
        whenever(analysisRunRepository.save(any<AnalysisRun>())).thenAnswer { it.arguments[0] }
        whenever(apiUsageService.checkAndIncrementQuota(any(), any())).thenReturn(true)

        whenever(visionProvider.analyze(any())).thenReturn(
            ImageAnalysisResult(provider = "cloud-vision"),
        )
        whenever(geminiProvider.analyze(any())).thenReturn(
            ImageAnalysisResult(provider = "gemini-cultural"),
        )

        orchestrator.onMediaAnalysisRequested(createEvent())

        assertEquals(ModerationStatus.PENDING_REVIEW, run.moderationStatus)
    }
}
