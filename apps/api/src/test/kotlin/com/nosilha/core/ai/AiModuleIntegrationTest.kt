package com.nosilha.core.ai

import com.nosilha.core.ai.domain.AnalysisRunStatus
import com.nosilha.core.ai.domain.ImageAnalysisProvider
import com.nosilha.core.ai.domain.ImageAnalysisResult
import com.nosilha.core.ai.domain.LabelResult
import com.nosilha.core.ai.domain.ModerationStatus
import com.nosilha.core.ai.repository.AiFeatureConfigRepository
import com.nosilha.core.ai.repository.AnalysisRunRepository
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.domain.MediaSource
import com.nosilha.core.gallery.domain.UserUploadedMedia
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.reset
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import tools.jackson.databind.json.JsonMapper
import java.util.UUID

/**
 * Integration tests for the AI module.
 *
 * Tests the AI analysis trigger, moderation workflow, authorization, and health endpoints
 * with mocked AI providers and real database via Testcontainers.
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class AiModuleIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jsonMapper: JsonMapper

    @Autowired
    private lateinit var galleryMediaRepository: GalleryMediaRepository

    @Autowired
    private lateinit var analysisRunRepository: AnalysisRunRepository

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @Autowired
    private lateinit var configRepository: AiFeatureConfigRepository

    @MockitoBean
    private lateinit var mockProvider: ImageAnalysisProvider

    private val adminId = UUID.randomUUID()
    private val testUserId = UUID.randomUUID()

    @BeforeEach
    fun setup() {
        // Clean up in FK-safe order using JDBC to avoid constraint violations
        jdbcTemplate.execute("DELETE FROM ai_api_usage")
        jdbcTemplate.execute("DELETE FROM ai_analysis_log")
        jdbcTemplate.execute("DELETE FROM ai_analysis_batch")
        jdbcTemplate.execute("DELETE FROM event_publication")
        galleryMediaRepository.deleteAll()
        jdbcTemplate.execute("DELETE FROM users")
        // Insert test users for FK constraints on created_by/updated_by
        jdbcTemplate.execute(
            "INSERT INTO users (id, email) VALUES ('$adminId', 'admin@test.com'), ('$testUserId', 'user@test.com') ON CONFLICT DO NOTHING",
        )
        // Enable global + gallery domain for AI analysis tests
        configRepository.findByDomain("global")?.let {
            it.enabled = true
            configRepository.save(it)
        }
        configRepository.findByDomain("gallery")?.let {
            it.enabled = true
            configRepository.save(it)
        }

        reset(mockProvider)
        whenever(mockProvider.name).thenReturn("cloud-vision")
        whenever(mockProvider.isEnabled()).thenReturn(true)
        whenever(mockProvider.supports()).thenReturn(emptySet())
        whenever(mockProvider.capabilities()).thenReturn(emptySet())
        whenever(mockProvider.monthlyLimit).thenReturn(1000)
    }

    private fun adminAuth(userId: UUID = adminId) =
        authentication(
            UsernamePasswordAuthenticationToken(
                userId.toString(),
                null,
                listOf(SimpleGrantedAuthority("ROLE_ADMIN")),
            ),
        )

    private fun userAuth(userId: UUID = testUserId) =
        authentication(
            UsernamePasswordAuthenticationToken(
                userId.toString(),
                null,
                listOf(SimpleGrantedAuthority("ROLE_USER")),
            ),
        )

    private fun createActiveMedia(): UserUploadedMedia {
        val media = UserUploadedMedia().apply {
            this.title = "Test Heritage Photo"
            this.status = GalleryMediaStatus.ACTIVE
            this.publicUrl = "https://media.example.com/test-image.jpg"
            this.source = MediaSource.LOCAL
            this.uploadedBy = testUserId
            this.displayOrder = 0
            this.fileName = "test-image.jpg"
            this.originalName = "heritage-photo.jpg"
            this.contentType = "image/jpeg"
            this.fileSize = 1024L
            this.storageKey = "uploads/test-image.jpg"
        }
        return galleryMediaRepository.save(media)
    }

    /**
     * Waits for an AnalysisRun to appear for the given media ID.
     * Event processing via @ApplicationModuleListener runs after
     * transaction commit, so a brief poll is needed.
     */
    private fun awaitAnalysisRun(
        mediaId: UUID,
        timeoutMs: Long = 5000,
    ): List<com.nosilha.core.ai.domain.AnalysisRun> {
        val start = System.currentTimeMillis()
        while (System.currentTimeMillis() - start < timeoutMs) {
            val runs = analysisRunRepository.findByMediaId(mediaId)
            if (runs.isNotEmpty()) return runs
            Thread.sleep(100)
        }
        return analysisRunRepository.findByMediaId(mediaId)
    }

    /**
     * Waits for AI fields to be applied to the media entity.
     * The AiResultsApprovedEvent is processed asynchronously after the
     * approve transaction commits.
     */
    private fun awaitAiFieldsApplied(
        mediaId: UUID,
        timeoutMs: Long = 5000,
    ): UserUploadedMedia {
        val start = System.currentTimeMillis()
        while (System.currentTimeMillis() - start < timeoutMs) {
            val media = galleryMediaRepository.findById(mediaId).orElseThrow() as UserUploadedMedia
            if (media.aiAltText != null) return media
            Thread.sleep(100)
        }
        return galleryMediaRepository.findById(mediaId).orElseThrow() as UserUploadedMedia
    }

    // =========================================================================
    // Trigger Analysis -> AnalysisRun Created
    // =========================================================================

    @Test
    @DisplayName("Trigger analysis creates AnalysisRun and returns 202")
    fun `trigger analysis for active media should return 202 with run ID`() {
        val media = createActiveMedia()

        whenever(mockProvider.analyze(any())).thenReturn(
            ImageAnalysisResult(
                provider = "cloud-vision",
                labels = listOf(LabelResult("church", 0.95f)),
                landmarks = listOf("Nova Sintra"),
            ),
        )

        mockMvc
            .perform(
                post("/api/v1/admin/gallery/${media.id}/analyze")
                    .with(adminAuth()),
            ).andExpect(status().isAccepted)
            .andExpect(jsonPath("$.data.mediaId").value(media.id.toString()))
            .andExpect(jsonPath("$.data.analysisRunId").isNotEmpty)
            .andExpect(jsonPath("$.data.status").value("PROCESSING"))

        // Wait for event processing and verify AnalysisRun was created
        val runs = awaitAnalysisRun(media.id!!)
        assertThat(runs).isNotEmpty
    }

    // =========================================================================
    // Moderation Approve -> AI Fields Applied
    // =========================================================================

    @Test
    @DisplayName("Approve AI results applies fields to UserUploadedMedia")
    fun `approve run should apply AI fields to media entity`() {
        val media = createActiveMedia()

        whenever(mockProvider.analyze(any())).thenReturn(
            ImageAnalysisResult(
                provider = "cloud-vision",
                labels = listOf(LabelResult("church", 0.95f)),
                altText = "Historic church in Nova Sintra",
                description = "A traditional church in the center of Nova Sintra, Brava Island",
                tags = listOf("heritage", "architecture"),
            ),
        )

        // Trigger analysis
        mockMvc
            .perform(
                post("/api/v1/admin/gallery/${media.id}/analyze")
                    .with(adminAuth()),
            ).andExpect(status().isAccepted)

        // Wait for event processing and find the completed run
        val runs = awaitAnalysisRun(media.id!!)
        assertThat(runs).isNotEmpty
        val run = runs.first()
        assertThat(run.status).isEqualTo(AnalysisRunStatus.COMPLETED)
        assertThat(run.moderationStatus).isEqualTo(ModerationStatus.PENDING_REVIEW)

        // Approve the run
        mockMvc
            .perform(
                post("/api/v1/admin/ai/review/${run.id}/approve")
                    .with(adminAuth()),
            ).andExpect(status().isOk)

        // Wait for the AiResultsApprovedEvent to be processed by the gallery module
        val updatedMedia = awaitAiFieldsApplied(media.id!!)
        assertThat(updatedMedia.aiAltText).isEqualTo("Historic church in Nova Sintra")
        assertThat(updatedMedia.aiDescription).isEqualTo("A traditional church in the center of Nova Sintra, Brava Island")
        assertThat(updatedMedia.aiTags).containsExactlyInAnyOrder("heritage", "architecture")
        assertThat(updatedMedia.aiProcessedAt).isNotNull()
    }

    // =========================================================================
    // Authorization: Non-admin Gets 403
    // =========================================================================

    @Test
    @DisplayName("Non-admin user gets 403 on AI review queue")
    fun `non-admin should get 403 on AI review queue`() {
        mockMvc
            .perform(
                get("/api/v1/admin/ai/review-queue")
                    .with(userAuth()),
            ).andExpect(status().isForbidden)
    }

    @Test
    @DisplayName("Non-admin user gets 403 on AI health endpoint")
    fun `non-admin should get 403 on AI health endpoint`() {
        mockMvc
            .perform(
                get("/api/v1/admin/ai/health")
                    .with(userAuth()),
            ).andExpect(status().isForbidden)
    }

    @Test
    @DisplayName("Non-admin user gets 403 on trigger analysis")
    fun `non-admin should get 403 on trigger analysis`() {
        val media = createActiveMedia()

        mockMvc
            .perform(
                post("/api/v1/admin/gallery/${media.id}/analyze")
                    .with(userAuth()),
            ).andExpect(status().isForbidden)
    }

    // =========================================================================
    // Health Endpoint Returns Provider Stats
    // =========================================================================

    @Test
    @DisplayName("Health endpoint returns provider information")
    fun `health endpoint should return provider stats`() {
        mockMvc
            .perform(
                get("/api/v1/admin/ai/health")
                    .with(adminAuth()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data.enabled").exists())
            .andExpect(jsonPath("$.data.providers").isArray)
    }

    // =========================================================================
    // Review Queue
    // =========================================================================

    @Test
    @DisplayName("Review queue returns pending runs")
    fun `review queue should return analysis runs pending review`() {
        val media = createActiveMedia()

        whenever(mockProvider.analyze(any())).thenReturn(
            ImageAnalysisResult(
                provider = "cloud-vision",
                altText = "Test alt text",
                tags = listOf("test"),
            ),
        )

        // Trigger analysis
        mockMvc
            .perform(
                post("/api/v1/admin/gallery/${media.id}/analyze")
                    .with(adminAuth()),
            ).andExpect(status().isAccepted)

        // Wait for event processing
        awaitAnalysisRun(media.id!!)

        // Check review queue
        mockMvc
            .perform(
                get("/api/v1/admin/ai/review-queue")
                    .with(adminAuth()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data").isArray)
            .andExpect(jsonPath("$.data[0].mediaId").value(media.id.toString()))
            .andExpect(jsonPath("$.data[0].moderationStatus").value("PENDING_REVIEW"))
    }

    // =========================================================================
    // Reject AI Results
    // =========================================================================

    @Test
    @DisplayName("Reject AI results does not apply fields to media")
    fun `reject run should not apply AI fields to media entity`() {
        val media = createActiveMedia()

        whenever(mockProvider.analyze(any())).thenReturn(
            ImageAnalysisResult(
                provider = "cloud-vision",
                altText = "Some alt text",
                description = "Some description",
                tags = listOf("tag1"),
            ),
        )

        // Trigger analysis
        mockMvc
            .perform(
                post("/api/v1/admin/gallery/${media.id}/analyze")
                    .with(adminAuth()),
            ).andExpect(status().isAccepted)

        // Wait for event processing
        val runs = awaitAnalysisRun(media.id!!)
        val run = runs.first()

        // Reject the run
        mockMvc
            .perform(
                post("/api/v1/admin/ai/review/${run.id}/reject")
                    .with(adminAuth())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(mapOf("notes" to "Not accurate"))),
            ).andExpect(status().isOk)

        // Verify AI fields were NOT applied to the media entity
        val updatedMedia = galleryMediaRepository.findById(media.id!!).orElseThrow() as UserUploadedMedia
        assertThat(updatedMedia.aiAltText).isNull()
        assertThat(updatedMedia.aiDescription).isNull()
        assertThat(updatedMedia.aiTags).isNull()
        assertThat(updatedMedia.aiProcessedAt).isNull()

        // Verify run is marked as rejected
        val updatedRun = analysisRunRepository.findById(run.id!!).orElseThrow()
        assertThat(updatedRun.moderationStatus).isEqualTo(ModerationStatus.REJECTED)
    }
}
