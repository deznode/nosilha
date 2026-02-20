package com.nosilha.core.ai

import com.nosilha.core.ai.api.dto.GenerateDirectoryContentRequest
import com.nosilha.core.ai.api.dto.GeneratePromptsRequest
import com.nosilha.core.ai.api.dto.PolishContentRequest
import com.nosilha.core.ai.api.dto.UpdateDomainConfigRequest
import com.nosilha.core.ai.domain.GeminiDirectoryContentOutput
import com.nosilha.core.ai.domain.ImageAnalysisProvider
import com.nosilha.core.ai.domain.ImageAnalysisResult
import com.nosilha.core.ai.domain.LabelResult
import com.nosilha.core.ai.domain.TextAiResult
import com.nosilha.core.ai.provider.TextAiProvider
import com.nosilha.core.ai.repository.AiFeatureConfigRepository
import com.nosilha.core.gallery.domain.GalleryMediaStatus
import com.nosilha.core.gallery.domain.MediaSource
import com.nosilha.core.gallery.domain.UserUploadedMedia
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import tools.jackson.databind.json.JsonMapper
import java.util.UUID

/**
 * Integration tests for AI domain feature config CRUD, health endpoint
 * domain inclusion, and domain-level guards on AI operations.
 */
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class AiFeatureConfigIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jsonMapper: JsonMapper

    @Autowired
    private lateinit var configRepository: AiFeatureConfigRepository

    @Autowired
    private lateinit var galleryMediaRepository: GalleryMediaRepository

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @MockitoBean
    private lateinit var mockProvider: ImageAnalysisProvider

    @MockitoBean
    private lateinit var textAiProvider: TextAiProvider

    private val adminId = UUID.randomUUID()
    private val testUserId = UUID.randomUUID()

    @BeforeEach
    fun setup() {
        // Wait briefly for any pending async events to complete
        Thread.sleep(200)

        // Clean up in FK-safe order
        jdbcTemplate.execute("DELETE FROM ai_api_usage")
        jdbcTemplate.execute("DELETE FROM event_publication")
        jdbcTemplate.execute("DELETE FROM ai_analysis_log")
        jdbcTemplate.execute("DELETE FROM ai_analysis_batch")
        galleryMediaRepository.deleteAll()
        jdbcTemplate.execute("DELETE FROM users")

        // Enable global, disable domain configs
        configRepository.findAll().forEach {
            it.enabled = (it.domain == "global")
            configRepository.save(it)
        }

        // Insert test users for FK constraints
        jdbcTemplate.execute(
            "INSERT INTO users (id, email) VALUES ('$adminId', 'admin@test.com'), ('$testUserId', 'user@test.com') ON CONFLICT DO NOTHING",
        )

        reset(mockProvider)
        whenever(mockProvider.name).thenReturn("cloud-vision")
        whenever(mockProvider.isEnabled()).thenReturn(true)
        whenever(mockProvider.supports()).thenReturn(emptySet())
        whenever(mockProvider.capabilities()).thenReturn(emptySet())
        whenever(mockProvider.monthlyLimit).thenReturn(1000)

        reset(textAiProvider)
        whenever(textAiProvider.name).thenReturn("gemini-text")
        whenever(textAiProvider.isEnabled()).thenReturn(true)
        whenever(textAiProvider.capabilities()).thenReturn(setOf("POLISH", "TRANSLATE", "PROMPTS", "DIRECTORY_CONTENT"))
        whenever(textAiProvider.monthlyLimit).thenReturn(1000)
    }

    private fun adminAuth() =
        authentication(
            UsernamePasswordAuthenticationToken(
                adminId.toString(),
                null,
                listOf(SimpleGrantedAuthority("ROLE_ADMIN")),
            ),
        )

    private fun userAuth() =
        authentication(
            UsernamePasswordAuthenticationToken(
                testUserId.toString(),
                null,
                listOf(SimpleGrantedAuthority("ROLE_USER"), SimpleGrantedAuthority("ROLE_authenticated")),
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
        return galleryMediaRepository.save(media) as UserUploadedMedia
    }

    // =========================================================================
    // Config CRUD Endpoints
    // =========================================================================

    @Nested
    @DisplayName("GET /api/v1/admin/ai/config")
    inner class GetConfigs {
        @Test
        @DisplayName("returns all domain configs for admin")
        fun `should return all domain configs`() {
            mockMvc
                .perform(
                    get("/api/v1/admin/ai/config")
                        .with(adminAuth()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data").isArray)
                .andExpect(jsonPath("$.data.length()").value(4))
                .andExpect(jsonPath("$.data[0].domain").exists())
                .andExpect(jsonPath("$.data[0].enabled").exists())
        }

        @Test
        @DisplayName("returns 403 for non-admin")
        fun `should return 403 for non-admin`() {
            mockMvc
                .perform(
                    get("/api/v1/admin/ai/config")
                        .with(userAuth()),
                ).andExpect(status().isForbidden)
        }
    }

    @Nested
    @DisplayName("PUT /api/v1/admin/ai/config/{domain}")
    inner class UpdateConfig {
        @Test
        @DisplayName("enables a domain successfully")
        fun `should enable domain and return updated config`() {
            mockMvc
                .perform(
                    put("/api/v1/admin/ai/config/gallery")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(UpdateDomainConfigRequest(enabled = true))),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.domain").value("gallery"))
                .andExpect(jsonPath("$.data.enabled").value(true))

            // Verify persisted
            val config = configRepository.findByDomain("gallery")
            assertThat(config).isNotNull
            assertThat(config!!.enabled).isTrue()
        }

        @Test
        @DisplayName("disables a domain successfully")
        fun `should disable domain and return updated config`() {
            // First enable it
            val config = configRepository.findByDomain("stories")!!
            config.enabled = true
            configRepository.save(config)

            mockMvc
                .perform(
                    put("/api/v1/admin/ai/config/stories")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(UpdateDomainConfigRequest(enabled = false))),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.domain").value("stories"))
                .andExpect(jsonPath("$.data.enabled").value(false))
        }

        @Test
        @DisplayName("returns 404 for unknown domain")
        fun `should return 404 for unknown domain`() {
            mockMvc
                .perform(
                    put("/api/v1/admin/ai/config/unknown-domain")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(UpdateDomainConfigRequest(enabled = true))),
                ).andExpect(status().isNotFound)
        }

        @Test
        @DisplayName("returns 403 for non-admin")
        fun `should return 403 for non-admin`() {
            mockMvc
                .perform(
                    put("/api/v1/admin/ai/config/gallery")
                        .with(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(UpdateDomainConfigRequest(enabled = true))),
                ).andExpect(status().isForbidden)
        }
    }

    // =========================================================================
    // Health Endpoint Includes Domains
    // =========================================================================

    @Nested
    @DisplayName("GET /api/v1/admin/ai/health — domains field")
    inner class HealthDomains {
        @Test
        @DisplayName("health response includes domains array")
        fun `should include domains in health response`() {
            mockMvc
                .perform(
                    get("/api/v1/admin/ai/health")
                        .with(adminAuth()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.domains").isArray)
                .andExpect(jsonPath("$.data.domains.length()").value(3))
                .andExpect(jsonPath("$.data.domains[0].domain").exists())
                .andExpect(jsonPath("$.data.domains[0].enabled").exists())
        }

        @Test
        @DisplayName("health domains reflect toggle state")
        fun `should reflect current toggle state in domains`() {
            // Enable gallery
            val config = configRepository.findByDomain("gallery")!!
            config.enabled = true
            configRepository.save(config)

            mockMvc
                .perform(
                    get("/api/v1/admin/ai/health")
                        .with(adminAuth()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.domains[?(@.domain == 'gallery')].enabled").value(true))
                .andExpect(jsonPath("$.data.domains[?(@.domain == 'stories')].enabled").value(false))
                .andExpect(jsonPath("$.data.domains[?(@.domain == 'directory')].enabled").value(false))
        }
    }

    // =========================================================================
    // Gallery Domain Guard
    // =========================================================================

    @Nested
    @DisplayName("Gallery domain guard")
    inner class GalleryGuard {
        @Test
        @DisplayName("trigger analysis blocked when gallery AI disabled")
        fun `should block analysis trigger when gallery disabled`() {
            val media = createActiveMedia()

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/${media.id}/analyze")
                        .with(adminAuth()),
                ).andExpect(status().isUnprocessableEntity)
        }

        @Test
        @DisplayName("trigger analysis allowed when gallery AI enabled")
        fun `should allow analysis trigger when gallery enabled`() {
            // Enable gallery domain
            val config = configRepository.findByDomain("gallery")!!
            config.enabled = true
            configRepository.save(config)

            val media = createActiveMedia()

            whenever(mockProvider.analyze(any())).thenReturn(
                ImageAnalysisResult(
                    provider = "cloud-vision",
                    labels = listOf(LabelResult("church", 0.95f)),
                ),
            )

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/${media.id}/analyze")
                        .with(adminAuth()),
                ).andExpect(status().isAccepted)
        }
    }

    // =========================================================================
    // Stories Domain Guard (AiController)
    // =========================================================================

    @Nested
    @DisplayName("Stories domain guard")
    inner class StoriesGuard {
        @Test
        @DisplayName("polish returns original content when stories disabled")
        fun `polish should return aiApplied false when stories disabled`() {
            mockMvc
                .perform(
                    post("/api/v1/ai/polish")
                        .with(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(PolishContentRequest(content = "Original text"))),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.content").value("Original text"))
                .andExpect(jsonPath("$.data.aiApplied").value(false))
        }

        @Test
        @DisplayName("prompts returns 422 when stories disabled")
        fun `prompts should return 422 when stories disabled`() {
            mockMvc
                .perform(
                    post("/api/v1/ai/prompts")
                        .with(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            jsonMapper.writeValueAsString(
                                GeneratePromptsRequest(templateType = "personal-memory"),
                            ),
                        ),
                ).andExpect(status().isUnprocessableEntity)
        }

        @Test
        @DisplayName("available returns false when stories disabled")
        fun `available should return false when stories disabled`() {
            whenever(textAiProvider.isEnabled()).thenReturn(true)

            mockMvc
                .perform(
                    get("/api/v1/ai/available")
                        .with(userAuth()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.available").value(false))
        }

        @Test
        @DisplayName("polish calls provider when stories enabled")
        fun `polish should call provider when stories enabled`() {
            val config = configRepository.findByDomain("stories")!!
            config.enabled = true
            configRepository.save(config)

            whenever(textAiProvider.polishContent(any())).thenReturn(
                TextAiResult(content = "Polished text", aiApplied = true),
            )

            mockMvc
                .perform(
                    post("/api/v1/ai/polish")
                        .with(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(PolishContentRequest(content = "Original text"))),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.content").value("Polished text"))
                .andExpect(jsonPath("$.data.aiApplied").value(true))
        }
    }

    // =========================================================================
    // Global AI Toggle
    // =========================================================================

    @Nested
    @DisplayName("Global AI toggle")
    inner class GlobalToggle {
        @Test
        @DisplayName("health enabled reflects global config state")
        fun `health enabled should reflect global config`() {
            mockMvc
                .perform(
                    get("/api/v1/admin/ai/health")
                        .with(adminAuth()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.enabled").value(true))
        }

        @Test
        @DisplayName("health enabled reflects disabled global")
        fun `toggle global to disabled updates health enabled`() {
            val global = configRepository.findByDomain("global")!!
            global.enabled = false
            configRepository.save(global)

            mockMvc
                .perform(
                    get("/api/v1/admin/ai/health")
                        .with(adminAuth()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.enabled").value(false))
        }

        @Test
        @DisplayName("global disabled blocks stories even when domain enabled")
        fun `global disabled blocks stories even when enabled`() {
            // Disable global
            val global = configRepository.findByDomain("global")!!
            global.enabled = false
            configRepository.save(global)

            // Enable stories
            val stories = configRepository.findByDomain("stories")!!
            stories.enabled = true
            configRepository.save(stories)

            // Polish should return aiApplied=false
            mockMvc
                .perform(
                    post("/api/v1/ai/polish")
                        .with(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(PolishContentRequest(content = "Hello"))),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.aiApplied").value(false))
        }

        @Test
        @DisplayName("global disabled blocks gallery even when gallery enabled")
        fun `global disabled blocks gallery analysis`() {
            // Disable global
            val global = configRepository.findByDomain("global")!!
            global.enabled = false
            configRepository.save(global)

            // Enable gallery
            val gallery = configRepository.findByDomain("gallery")!!
            gallery.enabled = true
            configRepository.save(gallery)

            val media = createActiveMedia()

            mockMvc
                .perform(
                    post("/api/v1/admin/gallery/${media.id}/analyze")
                        .with(adminAuth()),
                ).andExpect(status().isUnprocessableEntity)
        }

        @Test
        @DisplayName("global toggle via PUT config endpoint")
        fun `should toggle global via config endpoint`() {
            mockMvc
                .perform(
                    put("/api/v1/admin/ai/config/global")
                        .with(adminAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(UpdateDomainConfigRequest(enabled = false))),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.domain").value("global"))
                .andExpect(jsonPath("$.data.enabled").value(false))

            val config = configRepository.findByDomain("global")
            assertThat(config).isNotNull
            assertThat(config!!.enabled).isFalse()
        }

        @Test
        @DisplayName("health excludes global from domains array")
        fun `health domains should not include global`() {
            mockMvc
                .perform(
                    get("/api/v1/admin/ai/health")
                        .with(adminAuth()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.domains.length()").value(3))
                .andExpect(jsonPath("$.data.domains[?(@.domain == 'global')]").doesNotExist())
        }
    }

    // =========================================================================
    // Directory Domain Guard (AiController)
    // =========================================================================

    @Nested
    @DisplayName("Directory domain guard")
    inner class DirectoryGuard {
        @Test
        @DisplayName("directory-content returns 422 when directory disabled")
        fun `directory-content should return 422 when directory disabled`() {
            mockMvc
                .perform(
                    post("/api/v1/ai/directory-content")
                        .with(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            jsonMapper.writeValueAsString(
                                GenerateDirectoryContentRequest(name = "Casa da Morna", category = "Restaurant"),
                            ),
                        ),
                ).andExpect(status().isUnprocessableEntity)
        }

        @Test
        @DisplayName("directory-content works when directory enabled")
        fun `directory-content should succeed when directory enabled`() {
            val config = configRepository.findByDomain("directory")!!
            config.enabled = true
            configRepository.save(config)

            whenever(textAiProvider.generateDirectoryContent(any(), any())).thenReturn(
                GeminiDirectoryContentOutput(
                    description = "A charming restaurant.",
                    tags = listOf("traditional"),
                ),
            )

            mockMvc
                .perform(
                    post("/api/v1/ai/directory-content")
                        .with(userAuth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            jsonMapper.writeValueAsString(
                                GenerateDirectoryContentRequest(name = "Casa da Morna", category = "Restaurant"),
                            ),
                        ),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.data.description").value("A charming restaurant."))
        }
    }
}
