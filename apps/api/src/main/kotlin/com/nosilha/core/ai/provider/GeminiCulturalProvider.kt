package com.nosilha.core.ai.provider

import com.google.genai.Client
import com.google.genai.types.Content
import com.google.genai.types.GenerateContentConfig
import com.google.genai.types.Part
import com.google.genai.types.Schema
import com.google.genai.types.Type
import com.nosilha.core.ai.domain.AnalysisCapability
import com.nosilha.core.ai.domain.CulturalPromptTemplates
import com.nosilha.core.ai.domain.ImageAnalysisProvider
import com.nosilha.core.ai.domain.ImageAnalysisRequest
import com.nosilha.core.ai.domain.ImageAnalysisResult
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import tools.jackson.module.kotlin.jacksonObjectMapper
import tools.jackson.module.kotlin.readValue

private val logger = KotlinLogging.logger {}

/**
 * Google Gemini provider for culturally-aware image descriptions.
 *
 * Uses Brava Island cultural context prompts and Gemini's native
 * structured output (controlled generation) to produce guaranteed-valid
 * JSON with alt text, descriptions, and semantic tags.
 *
 * Activated conditionally via `nosilha.ai.gemini.enabled`.
 */
@Component
@ConditionalOnProperty("nosilha.ai.gemini.enabled", havingValue = "true")
class GeminiCulturalProvider(
    @Value("\${nosilha.ai.gemini.api-key}")
    private val apiKey: String,
    @Value("\${nosilha.ai.gemini.model:gemini-2.5-flash}")
    private val model: String,
    @Value("\${nosilha.ai.gemini.max-output-tokens:2048}")
    private val maxOutputTokens: Int,
) : ImageAnalysisProvider {
    override val name: String = "gemini-cultural"

    override fun isEnabled(): Boolean = apiKey.isNotBlank()

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

        val client = Client.builder().apiKey(apiKey).build()

        val config = GenerateContentConfig
            .builder()
            .maxOutputTokens(maxOutputTokens)
            .temperature(0.3f)
            .responseMimeType("application/json")
            .responseSchema(RESPONSE_SCHEMA)
            .build()

        val content = Content.fromParts(
            Part.fromText(prompt),
            Part.fromUri(request.imageUrl, "image/jpeg"),
        )

        val response = client.models.generateContent(model, content, config)

        val responseText = response.text() ?: ""
        logger.debug { "Gemini raw response for ${request.mediaId}: $responseText" }

        return parseGeminiResponse(responseText)
    }

    private data class GeminiResponse(
        val altText: String = "",
        val description: String = "",
        val tags: List<String> = emptyList(),
    )

    private val objectMapper = jacksonObjectMapper()

    private fun parseGeminiResponse(responseText: String): ImageAnalysisResult =
        try {
            val parsed = objectMapper.readValue<GeminiResponse>(responseText)
            ImageAnalysisResult(
                provider = name,
                altText = parsed.altText,
                description = parsed.description,
                tags = parsed.tags,
                rawJson = responseText,
            )
        } catch (e: Exception) {
            logger.error(e) { "Failed to parse Gemini structured response" }
            ImageAnalysisResult(
                provider = name,
                description = responseText.take(2048),
                rawJson = responseText,
            )
        }

    companion object {
        /**
         * JSON schema enforced by Gemini's controlled generation.
         * Ensures the response is always valid JSON matching this structure.
         */
        private val RESPONSE_SCHEMA: Schema = Schema
            .builder()
            .type(Type.Known.OBJECT)
            .properties(
                mapOf(
                    "altText" to Schema
                        .builder()
                        .type(Type.Known.STRING)
                        .description("Concise, accessible alt text for the image (max 150 chars)")
                        .build(),
                    "description" to Schema
                        .builder()
                        .type(Type.Known.STRING)
                        .description("Rich description highlighting cultural significance (max 500 chars)")
                        .build(),
                    "tags" to Schema
                        .builder()
                        .type(Type.Known.ARRAY)
                        .description("Cultural terms, locations, and themes (5-10 tags)")
                        .items(
                            Schema
                                .builder()
                                .type(Type.Known.STRING)
                                .build(),
                        ).build(),
                ),
            ).required(listOf("altText", "description", "tags"))
            .propertyOrdering(listOf("altText", "description", "tags"))
            .build()
    }
}
