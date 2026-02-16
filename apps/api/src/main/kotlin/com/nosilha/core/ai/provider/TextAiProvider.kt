package com.nosilha.core.ai.provider

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.JsonPropertyOrder
import com.nosilha.core.ai.domain.ApiUsageService
import com.nosilha.core.ai.domain.TextPromptTemplates
import io.github.oshai.kotlinlogging.KotlinLogging
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
    private val chatClient = chatClientBuilder.build()

    fun isAvailable(): Boolean = true

    fun polishContent(content: String): String {
        if (!checkQuota()) {
            logger.warn { "Text AI quota exceeded for polish operation" }
            return content
        }
        return try {
            val prompt = TextPromptTemplates.polishPrompt(content)
            val result = chatClient
                .prompt()
                .user(prompt)
                .call()
                .content()
            result ?: content
        } catch (e: Exception) {
            logger.error(e) { "Failed to polish content" }
            content
        }
    }

    fun translateContent(
        content: String,
        targetLang: String,
    ): String {
        if (!checkQuota()) {
            logger.warn { "Text AI quota exceeded for translate operation" }
            return content
        }
        return try {
            val prompt = TextPromptTemplates.translatePrompt(content, targetLang)
            val result = chatClient
                .prompt()
                .user(prompt)
                .call()
                .content()
            result ?: content
        } catch (e: Exception) {
            logger.error(e) { "Failed to translate content" }
            content
        }
    }

    fun generatePrompts(
        templateType: String,
        existingContent: String?,
    ): List<String> {
        if (!checkQuota()) {
            logger.warn { "Text AI quota exceeded for prompts operation" }
            return emptyList()
        }
        return try {
            val prompt = TextPromptTemplates.generatePromptsPrompt(templateType, existingContent)
            val result = chatClient
                .prompt()
                .user(prompt)
                .call()
                .entity(GeminiPromptsOutput::class.java)
            result?.prompts ?: emptyList()
        } catch (e: Exception) {
            logger.error(e) { "Failed to generate prompts" }
            emptyList()
        }
    }

    fun generateDirectoryContent(
        name: String,
        category: String,
    ): GeminiDirectoryContentOutput? {
        if (!checkQuota()) {
            logger.warn { "Text AI quota exceeded for directory content operation" }
            return null
        }
        return try {
            val prompt = TextPromptTemplates.directoryContentPrompt(name, category)
            chatClient
                .prompt()
                .user(prompt)
                .call()
                .entity(GeminiDirectoryContentOutput::class.java)
        } catch (e: Exception) {
            logger.error(e) { "Failed to generate directory content" }
            null
        }
    }

    private fun checkQuota(): Boolean = apiUsageService.checkAndIncrementQuota("gemini-text", textMonthlyLimit)
}
