package com.nosilha.core.ai.provider

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.JsonPropertyOrder
import com.nosilha.core.ai.domain.ApiUsageService
import com.nosilha.core.ai.domain.TextPromptTemplates
import com.nosilha.core.shared.exception.RateLimitExceededException
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.ai.chat.client.AdvisorParams
import org.springframework.ai.chat.client.ChatClient
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Service

private val logger = KotlinLogging.logger {}

/**
 * Structured output DTO for Gemini story prompt generation.
 */
@JsonPropertyOrder("prompts")
data class GeminiPromptsOutput
    @JsonCreator
    constructor(
        @param:JsonProperty("prompts") val prompts: List<String>,
    )

/**
 * Structured output DTO for Gemini directory content generation.
 */
@JsonPropertyOrder("description", "tags")
data class GeminiDirectoryContentOutput
    @JsonCreator
    constructor(
        @param:JsonProperty("description") val description: String,
        @param:JsonProperty("tags") val tags: List<String>,
    )

/**
 * Text AI provider using Spring AI ChatClient for content operations.
 *
 * Provides content polishing, translation, story prompt generation, and
 * directory content generation via Gemini. Uses separate "gemini-text" quota
 * tracking independent from image analysis.
 */
@Service
@ConditionalOnProperty("nosilha.ai.gemini.enabled", havingValue = "true")
class TextAiProvider(
    chatClientBuilder: ChatClient.Builder,
    private val apiUsageService: ApiUsageService,
    @Value("\${nosilha.ai.gemini.text-monthly-limit:1000}")
    private val textMonthlyLimit: Int,
) {
    private val chatClient = chatClientBuilder
        .defaultAdvisors(AdvisorParams.ENABLE_NATIVE_STRUCTURED_OUTPUT)
        .build()

    fun isAvailable(): Boolean = true

    fun polishContent(content: String): String =
        withQuotaAndFallback("polish content", content) {
            val prompt = TextPromptTemplates.polishPrompt(content)
            callText(prompt) ?: content
        }

    fun translateContent(
        content: String,
        targetLang: String,
    ): String =
        withQuotaAndFallback("translate content", content) {
            val prompt = TextPromptTemplates.translatePrompt(content, targetLang)
            callText(prompt) ?: content
        }

    fun generatePrompts(
        templateType: String,
        existingContent: String?,
    ): List<String> =
        withQuotaAndFallback("generate prompts", emptyList()) {
            val prompt = TextPromptTemplates.generatePromptsPrompt(templateType, existingContent)
            callEntity<GeminiPromptsOutput>(prompt)?.prompts ?: emptyList()
        }

    fun generateDirectoryContent(
        name: String,
        category: String,
    ): GeminiDirectoryContentOutput? =
        withQuotaAndFallback("generate directory content", null) {
            val prompt = TextPromptTemplates.directoryContentPrompt(name, category)
            callEntity<GeminiDirectoryContentOutput>(prompt)
        }

    private fun callText(prompt: String): String? =
        chatClient
            .prompt()
            .user(prompt)
            .call()
            .content()

    private inline fun <reified T : Any> callEntity(prompt: String): T? =
        chatClient
            .prompt()
            .user(prompt)
            .call()
            .entity(T::class.java)

    /**
     * Executes a text AI operation with quota enforcement and graceful fallback.
     * Returns [fallback] if quota is exceeded or an exception occurs.
     */
    private fun <T> withQuotaAndFallback(
        operation: String,
        fallback: T,
        block: () -> T,
    ): T {
        if (!apiUsageService.checkAndIncrementQuota("gemini-text", textMonthlyLimit)) {
            logger.warn { "Text AI quota exceeded for $operation" }
            throw RateLimitExceededException("Text AI monthly quota exceeded. Please try again next month.")
        }
        return try {
            block()
        } catch (e: Exception) {
            logger.error(e) { "Failed to $operation" }
            fallback
        }
    }
}
