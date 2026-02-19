package com.nosilha.core.ai

import com.nosilha.core.ai.api.dto.GenerateDirectoryContentRequest
import com.nosilha.core.ai.api.dto.GeneratePromptsRequest
import com.nosilha.core.ai.api.dto.PolishContentRequest
import com.nosilha.core.ai.api.dto.TranslateContentRequest
import com.nosilha.core.ai.domain.GeminiDirectoryContentOutput
import com.nosilha.core.ai.domain.TextAiResult
import com.nosilha.core.ai.provider.TextAiProvider
import com.nosilha.core.ai.repository.AiFeatureConfigRepository
import com.nosilha.core.shared.exception.BusinessException
import com.nosilha.core.shared.exception.RateLimitExceededException
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.anyOrNull
import org.mockito.kotlin.eq
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
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

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class AiControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var jsonMapper: JsonMapper

    @Autowired
    private lateinit var configRepository: AiFeatureConfigRepository

    @MockitoBean
    private lateinit var textAiProvider: TextAiProvider

    @BeforeEach
    fun setup() {
        // Enable all domain configs so tests exercise the provider layer
        configRepository.findAll().forEach {
            it.enabled = true
            configRepository.save(it)
        }
    }

    private fun authAs(userId: String) =
        authentication(
            UsernamePasswordAuthenticationToken(
                userId,
                null,
                listOf(SimpleGrantedAuthority("ROLE_USER"), SimpleGrantedAuthority("ROLE_authenticated")),
            ),
        )

    @Test
    @DisplayName("GET /api/v1/ai/available - returns 200 with availability status")
    fun `available check returns 200`() {
        whenever(textAiProvider.isAvailable()).thenReturn(true)

        mockMvc
            .perform(
                get("/api/v1/ai/available")
                    .with(authAs("user-123")),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data.available").value(true))
    }

    @Test
    @DisplayName("GET /api/v1/ai/available - returns 401 without authentication")
    fun `available check without auth returns 401`() {
        mockMvc
            .perform(
                get("/api/v1/ai/available"),
            ).andExpect(status().isUnauthorized)
    }

    @Test
    @DisplayName("POST /api/v1/ai/polish - success returns polished content with aiApplied=true")
    fun `polish with valid content returns 200`() {
        whenever(textAiProvider.polishContent(any())).thenReturn(
            TextAiResult(content = "Polished story text", aiApplied = true),
        )

        mockMvc
            .perform(
                post("/api/v1/ai/polish")
                    .with(authAs("user-123"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(PolishContentRequest(content = "Original text"))),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data.content").value("Polished story text"))
            .andExpect(jsonPath("$.data.aiApplied").value(true))
    }

    @Test
    @DisplayName("POST /api/v1/ai/polish - AI failure returns original content with aiApplied=false")
    fun `polish with AI failure returns aiApplied false`() {
        whenever(textAiProvider.polishContent(any())).thenReturn(
            TextAiResult(content = "Original text", aiApplied = false),
        )

        mockMvc
            .perform(
                post("/api/v1/ai/polish")
                    .with(authAs("user-123"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(PolishContentRequest(content = "Original text"))),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data.content").value("Original text"))
            .andExpect(jsonPath("$.data.aiApplied").value(false))
    }

    @Test
    @DisplayName("POST /api/v1/ai/polish - blank content returns 400")
    fun `polish with blank content returns 400`() {
        mockMvc
            .perform(
                post("/api/v1/ai/polish")
                    .with(authAs("user-123"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(PolishContentRequest(content = ""))),
            ).andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("POST /api/v1/ai/polish - quota exceeded returns 429")
    fun `polish quota exceeded returns 429`() {
        whenever(textAiProvider.polishContent(any())).thenThrow(
            RateLimitExceededException("Text AI monthly quota exceeded. Please try again next month."),
        )

        mockMvc
            .perform(
                post("/api/v1/ai/polish")
                    .with(authAs("user-123"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(PolishContentRequest(content = "Original text"))),
            ).andExpect(status().isTooManyRequests)
            .andExpect(jsonPath("$.message").value("Text AI monthly quota exceeded. Please try again next month."))
    }

    @Test
    @DisplayName("POST /api/v1/ai/polish - returns 401 without authentication")
    fun `polish without auth returns 401`() {
        mockMvc
            .perform(
                post("/api/v1/ai/polish")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(jsonMapper.writeValueAsString(PolishContentRequest(content = "Text"))),
            ).andExpect(status().isUnauthorized)
    }

    @Test
    @DisplayName("POST /api/v1/ai/translate - success returns translated content with aiApplied=true")
    fun `translate with valid content returns 200`() {
        whenever(textAiProvider.translateContent(any(), eq("PT"))).thenReturn(
            TextAiResult(content = "Texto traduzido", aiApplied = true),
        )

        mockMvc
            .perform(
                post("/api/v1/ai/translate")
                    .with(authAs("user-123"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        jsonMapper.writeValueAsString(
                            TranslateContentRequest(content = "Text to translate", targetLang = "PT"),
                        ),
                    ),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data.content").value("Texto traduzido"))
            .andExpect(jsonPath("$.data.aiApplied").value(true))
    }

    @Test
    @DisplayName("POST /api/v1/ai/translate - blank targetLang returns 400")
    fun `translate with blank targetLang returns 400`() {
        mockMvc
            .perform(
                post("/api/v1/ai/translate")
                    .with(authAs("user-123"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        jsonMapper.writeValueAsString(
                            TranslateContentRequest(content = "Text", targetLang = ""),
                        ),
                    ),
            ).andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("POST /api/v1/ai/translate - unsupported language returns 400")
    fun `translate with unsupported language returns 400`() {
        mockMvc
            .perform(
                post("/api/v1/ai/translate")
                    .with(authAs("user-123"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        jsonMapper.writeValueAsString(
                            TranslateContentRequest(content = "Text", targetLang = "ZH"),
                        ),
                    ),
            ).andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("POST /api/v1/ai/prompts - success returns prompts list")
    fun `prompts with valid request returns 200`() {
        whenever(textAiProvider.generatePrompts(any(), anyOrNull())).thenReturn(
            listOf("Prompt 1", "Prompt 2", "Prompt 3"),
        )

        mockMvc
            .perform(
                post("/api/v1/ai/prompts")
                    .with(authAs("user-123"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        jsonMapper.writeValueAsString(
                            GeneratePromptsRequest(templateType = "personal-memory", existingContent = "I remember..."),
                        ),
                    ),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data.prompts").isArray)
            .andExpect(jsonPath("$.data.prompts.length()").value(3))
    }

    @Test
    @DisplayName("POST /api/v1/ai/prompts - blank templateType returns 400")
    fun `prompts with blank templateType returns 400`() {
        mockMvc
            .perform(
                post("/api/v1/ai/prompts")
                    .with(authAs("user-123"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        jsonMapper.writeValueAsString(
                            GeneratePromptsRequest(templateType = ""),
                        ),
                    ),
            ).andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("POST /api/v1/ai/prompts - AI failure returns 500")
    fun `prompts with AI failure returns 500`() {
        whenever(textAiProvider.generatePrompts(any(), anyOrNull())).thenThrow(
            RuntimeException("Gemini API error"),
        )

        mockMvc
            .perform(
                post("/api/v1/ai/prompts")
                    .with(authAs("user-123"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        jsonMapper.writeValueAsString(
                            GeneratePromptsRequest(templateType = "personal-memory"),
                        ),
                    ),
            ).andExpect(status().isInternalServerError)
    }

    @Test
    @DisplayName("POST /api/v1/ai/prompts - BusinessException returns 422")
    fun `prompts with BusinessException returns 422`() {
        whenever(textAiProvider.generatePrompts(any(), anyOrNull())).thenThrow(
            BusinessException("Text AI is not available. Enable Gemini to use this feature."),
        )

        mockMvc
            .perform(
                post("/api/v1/ai/prompts")
                    .with(authAs("user-123"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        jsonMapper.writeValueAsString(
                            GeneratePromptsRequest(templateType = "personal-memory"),
                        ),
                    ),
            ).andExpect(status().isUnprocessableEntity)
            .andExpect(jsonPath("$.error").value("Business Rule Violation"))
    }

    @Test
    @DisplayName("POST /api/v1/ai/directory-content - success returns description and tags")
    fun `directory-content with valid request returns 200`() {
        whenever(textAiProvider.generateDirectoryContent(any(), any())).thenReturn(
            GeminiDirectoryContentOutput(
                description = "A charming restaurant in Nova Sintra.",
                tags = listOf("traditional", "local-cuisine"),
            ),
        )

        mockMvc
            .perform(
                post("/api/v1/ai/directory-content")
                    .with(authAs("user-123"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        jsonMapper.writeValueAsString(
                            GenerateDirectoryContentRequest(name = "Casa da Morna", category = "Restaurant"),
                        ),
                    ),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.data.description").value("A charming restaurant in Nova Sintra."))
            .andExpect(jsonPath("$.data.tags").isArray)
            .andExpect(jsonPath("$.data.tags.length()").value(2))
    }

    @Test
    @DisplayName("POST /api/v1/ai/directory-content - blank name returns 400")
    fun `directory-content with blank name returns 400`() {
        mockMvc
            .perform(
                post("/api/v1/ai/directory-content")
                    .with(authAs("user-123"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        jsonMapper.writeValueAsString(
                            GenerateDirectoryContentRequest(name = "", category = "Restaurant"),
                        ),
                    ),
            ).andExpect(status().isBadRequest)
    }

    @Test
    @DisplayName("POST /api/v1/ai/directory-content - BusinessException returns 422")
    fun `directory-content with BusinessException returns 422`() {
        whenever(textAiProvider.generateDirectoryContent(any(), any())).thenThrow(
            BusinessException("Text AI is not available. Enable Gemini to use this feature."),
        )

        mockMvc
            .perform(
                post("/api/v1/ai/directory-content")
                    .with(authAs("user-123"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        jsonMapper.writeValueAsString(
                            GenerateDirectoryContentRequest(name = "Casa da Morna", category = "Restaurant"),
                        ),
                    ),
            ).andExpect(status().isUnprocessableEntity)
            .andExpect(jsonPath("$.error").value("Business Rule Violation"))
    }

    @Test
    @DisplayName("POST /api/v1/ai/directory-content - AI failure returns 500")
    fun `directory-content with AI failure returns 500`() {
        whenever(textAiProvider.generateDirectoryContent(any(), any())).thenThrow(
            RuntimeException("Gemini API error"),
        )

        mockMvc
            .perform(
                post("/api/v1/ai/directory-content")
                    .with(authAs("user-123"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        jsonMapper.writeValueAsString(
                            GenerateDirectoryContentRequest(name = "Casa da Morna", category = "Restaurant"),
                        ),
                    ),
            ).andExpect(status().isInternalServerError)
    }
}
