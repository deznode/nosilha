package com.nosilha.core.ai.provider

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.JsonPropertyOrder
import com.nosilha.core.ai.domain.AnalysisCapability
import com.nosilha.core.ai.domain.ImageAnalysisProvider
import com.nosilha.core.ai.domain.ImageAnalysisRequest
import com.nosilha.core.ai.domain.ImageAnalysisResult
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.ai.chat.client.AdvisorParams
import org.springframework.ai.chat.client.ChatClient
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.core.io.Resource
import org.springframework.core.io.UrlResource
import org.springframework.stereotype.Component
import org.springframework.util.MimeTypeUtils
import tools.jackson.module.kotlin.jacksonObjectMapper
import java.net.URI
import java.nio.charset.StandardCharsets

private val logger = KotlinLogging.logger {}

/**
 * Structured output DTO for Gemini cultural analysis responses.
 *
 * <p>Spring AI's {@link org.springframework.ai.structured.BeanOutputConverter} auto-generates
 * a JSON Schema from this class and sends it to Gemini's controlled generation API,
 * ensuring the response always matches this structure.</p>
 */
@JsonPropertyOrder("title", "altText", "description", "tags")
data class GeminiCulturalResponse
    @JsonCreator
    constructor(
        @param:JsonProperty("title") val title: String = "",
        @param:JsonProperty("altText") val altText: String,
        @param:JsonProperty("description") val description: String,
        @param:JsonProperty("tags") val tags: List<String>,
    )

/**
 * Google Gemini provider for culturally-aware image descriptions.
 *
 * <p>Uses externalized prompt templates with system/user prompt separation.
 * The system prompt establishes a Brava Island cultural heritage expert persona;
 * the user prompt provides analysis instructions with prior context from Cloud Vision.</p>
 *
 * <p>Activated conditionally via {@code nosilha.ai.gemini.enabled}.</p>
 */
@Component
@ConditionalOnProperty("nosilha.ai.gemini.enabled", havingValue = "true")
class GeminiCulturalProvider(
    chatClientBuilder: ChatClient.Builder,
    @Value("classpath:/prompts/image/system.st")
    systemPromptResource: Resource,
    @Value("classpath:/prompts/image/analyze-user.st")
    analyzePromptResource: Resource,
    @Value("\${nosilha.ai.gemini.monthly-limit:500}")
    private val providerMonthlyLimit: Int,
) : ImageAnalysisProvider {
    private val analyzePrompt = analyzePromptResource.getContentAsString(StandardCharsets.UTF_8)

    private val chatClient = chatClientBuilder
        .defaultSystem(systemPromptResource.getContentAsString(StandardCharsets.UTF_8))
        .defaultAdvisors(AdvisorParams.ENABLE_NATIVE_STRUCTURED_OUTPUT)
        .build()

    private val objectMapper = jacksonObjectMapper()

    override val name: String = "gemini-cultural"
    override val monthlyLimit: Int get() = providerMonthlyLimit

    override fun isEnabled(): Boolean = true

    override fun supports(): Set<AnalysisCapability> =
        setOf(AnalysisCapability.CULTURAL_CONTEXT, AnalysisCapability.ALT_TEXT, AnalysisCapability.DESCRIPTION)

    override fun analyze(request: ImageAnalysisRequest): ImageAnalysisResult {
        logger.info { "Gemini analyzing media ${request.mediaId}" }

        val priorContext = buildPriorContext(request)

        val response = chatClient
            .prompt()
            .user { user ->
                user
                    .text(analyzePrompt)
                    .param("priorContext", priorContext)
                    .media(MimeTypeUtils.IMAGE_JPEG, UrlResource(URI(request.imageUrl)))
            }.call()
            .entity(GeminiCulturalResponse::class.java)!!

        logger.debug { "Gemini response for ${request.mediaId}: altText=${response.altText.take(50)}, tags=${response.tags}" }

        return ImageAnalysisResult(
            provider = name,
            title = response.title.ifBlank { null },
            altText = response.altText,
            description = response.description,
            tags = response.tags,
            rawJson = objectMapper.writeValueAsString(response),
        )
    }

    private fun buildPriorContext(request: ImageAnalysisRequest): String {
        val priorLabels = request.priorResults?.labels?.map { it.label } ?: emptyList()
        val priorLandmarks = request.priorResults?.landmarks ?: emptyList()

        val contextParts = buildList {
            if (priorLabels.isNotEmpty()) add("Detected labels: ${priorLabels.joinToString(", ")}")
            if (priorLandmarks.isNotEmpty()) add("Detected landmarks: ${priorLandmarks.joinToString(", ")}")
            if (request.culturalContext != null) add("Image title: ${request.culturalContext}")
        }

        return if (contextParts.isNotEmpty()) {
            "\n\nAdditional context from prior analysis:\n${contextParts.joinToString("\n")}"
        } else {
            ""
        }
    }
}
