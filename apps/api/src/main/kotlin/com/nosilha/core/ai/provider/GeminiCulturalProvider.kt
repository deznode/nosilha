package com.nosilha.core.ai.provider

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.JsonPropertyOrder
import com.nosilha.core.ai.domain.AnalysisCapability
import com.nosilha.core.ai.domain.CulturalPromptTemplates
import com.nosilha.core.ai.domain.ImageAnalysisProvider
import com.nosilha.core.ai.domain.ImageAnalysisRequest
import com.nosilha.core.ai.domain.ImageAnalysisResult
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.ai.chat.client.AdvisorParams
import org.springframework.ai.chat.client.ChatClient
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.core.io.UrlResource
import org.springframework.stereotype.Component
import org.springframework.util.MimeTypeUtils
import tools.jackson.module.kotlin.jacksonObjectMapper
import java.net.URI

private val logger = KotlinLogging.logger {}

/**
 * Structured output DTO for Gemini cultural analysis responses.
 *
 * Spring AI's [org.springframework.ai.structured.BeanOutputConverter] auto-generates
 * a JSON Schema from this class and sends it to Gemini's controlled generation API,
 * ensuring the response always matches this structure.
 */
@JsonPropertyOrder("altText", "description", "tags")
data class GeminiCulturalResponse
    @JsonCreator
    constructor(
        @param:JsonProperty("altText") val altText: String,
        @param:JsonProperty("description") val description: String,
        @param:JsonProperty("tags") val tags: List<String>,
    )

/**
 * Google Gemini provider for culturally-aware image descriptions.
 *
 * Uses Spring AI [ChatClient] with native structured output to call Gemini
 * with Brava Island cultural context prompts and multimodal image input.
 * The response is guaranteed to match [GeminiCulturalResponse] via Gemini's
 * controlled generation (JSON schema enforcement at the token level).
 *
 * Activated conditionally via `nosilha.ai.gemini.enabled`.
 */
@Component
@ConditionalOnProperty("nosilha.ai.gemini.enabled", havingValue = "true")
class GeminiCulturalProvider(
    chatClientBuilder: ChatClient.Builder,
) : ImageAnalysisProvider {
    private val chatClient = chatClientBuilder
        .defaultAdvisors(AdvisorParams.ENABLE_NATIVE_STRUCTURED_OUTPUT)
        .build()

    private val objectMapper = jacksonObjectMapper()

    override val name: String = "gemini-cultural"

    override fun isEnabled(): Boolean = true

    override fun supports(): Set<AnalysisCapability> =
        setOf(AnalysisCapability.CULTURAL_CONTEXT, AnalysisCapability.ALT_TEXT, AnalysisCapability.DESCRIPTION)

    override fun analyze(request: ImageAnalysisRequest): ImageAnalysisResult {
        logger.info { "Gemini analyzing media ${request.mediaId}" }

        val priorLabels = request.priorResults?.labels?.map { it.label } ?: emptyList()
        val priorLandmarks = request.priorResults?.landmarks ?: emptyList()

        val prompt = CulturalPromptTemplates.analysisPrompt(
            priorLabels = priorLabels,
            priorLandmarks = priorLandmarks,
            mediaTitle = request.culturalContext,
        )

        val response = chatClient
            .prompt()
            .user { user ->
                user
                    .text(prompt)
                    .media(MimeTypeUtils.IMAGE_JPEG, UrlResource(URI(request.imageUrl)))
            }.call()
            .entity(GeminiCulturalResponse::class.java)!!

        logger.debug { "Gemini response for ${request.mediaId}: altText=${response.altText.take(50)}, tags=${response.tags}" }

        return ImageAnalysisResult(
            provider = name,
            altText = response.altText,
            description = response.description,
            tags = response.tags,
            rawJson = objectMapper.writeValueAsString(response),
        )
    }
}
