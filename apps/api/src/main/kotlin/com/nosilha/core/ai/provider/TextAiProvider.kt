package com.nosilha.core.ai.provider

import com.nosilha.core.ai.domain.ApiUsageService
import com.nosilha.core.ai.domain.GeminiDirectoryContentOutput
import com.nosilha.core.ai.domain.GeminiPromptsOutput
import com.nosilha.core.ai.domain.TextAiResult
import com.nosilha.core.shared.exception.RateLimitExceededException
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.ai.chat.client.AdvisorParams
import org.springframework.ai.chat.client.ChatClient
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.core.io.Resource
import org.springframework.stereotype.Service
import java.nio.charset.StandardCharsets

private val logger = KotlinLogging.logger {}

/**
 * Text AI provider using Spring AI ChatClient for content operations.
 *
 * <p>Uses externalized prompt templates with system/user prompt separation.
 * The system prompt establishes a Cape Verdean cultural heritage persona;
 * each operation has a dedicated user prompt template in resources/prompts/text/.</p>
 *
 * <p>Error handling strategy:</p>
 * <ul>
 *   <li>Enhancement operations (polish, translate): graceful fallback with aiApplied=false</li>
 *   <li>Generative operations (prompts, directory-content): propagate exceptions</li>
 *   <li>Quota exceeded: throws {@link RateLimitExceededException} (HTTP 429)</li>
 * </ul>
 */
@Service
@ConditionalOnProperty("nosilha.ai.gemini.enabled", havingValue = "true")
class TextAiProvider(
    chatClientBuilder: ChatClient.Builder,
    private val apiUsageService: ApiUsageService,
    @Value("\${nosilha.ai.gemini.text-monthly-limit:1000}")
    private val textMonthlyLimit: Int,
    @Value("classpath:/prompts/text/system.st")
    systemPromptResource: Resource,
    @Value("classpath:/prompts/text/polish-user.st")
    polishPromptResource: Resource,
    @Value("classpath:/prompts/text/translate-user.st")
    translatePromptResource: Resource,
    @Value("classpath:/prompts/text/generate-prompts-user.st")
    generatePromptsPromptResource: Resource,
    @Value("classpath:/prompts/text/directory-content-user.st")
    directoryContentPromptResource: Resource,
) {
    private val polishPrompt = polishPromptResource.getContentAsString(StandardCharsets.UTF_8)
    private val translatePrompt = translatePromptResource.getContentAsString(StandardCharsets.UTF_8)
    private val generatePromptsPrompt = generatePromptsPromptResource.getContentAsString(StandardCharsets.UTF_8)
    private val directoryContentPrompt = directoryContentPromptResource.getContentAsString(StandardCharsets.UTF_8)

    private val chatClient = chatClientBuilder
        .defaultSystem(systemPromptResource.getContentAsString(StandardCharsets.UTF_8))
        .defaultAdvisors(AdvisorParams.ENABLE_NATIVE_STRUCTURED_OUTPUT)
        .build()

    companion object {
        private val SUPPORTED_LANGUAGES = mapOf(
            "EN" to "English",
            "PT" to "Portuguese",
            "KEA" to "Cape Verdean Kriolu",
            "FR" to "French",
        )
    }

    fun isAvailable(): Boolean = true

    /**
     * Enhancement operation: polishes content with graceful fallback.
     * Returns [TextAiResult] with aiApplied=false if AI call fails.
     */
    fun polishContent(content: String): TextAiResult {
        checkQuota("polish content")
        return try {
            val result = chatClient
                .prompt()
                .user { u -> u.text(polishPrompt).param("content", content) }
                .call()
                .content()
            TextAiResult(content = result ?: content, aiApplied = result != null)
        } catch (e: Exception) {
            logger.error(e) { "Failed to polish content, returning original" }
            TextAiResult(content = content, aiApplied = false)
        }
    }

    /**
     * Enhancement operation: translates content with graceful fallback.
     * Returns [TextAiResult] with aiApplied=false if AI call fails.
     */
    fun translateContent(
        content: String,
        targetLang: String,
    ): TextAiResult {
        val targetLanguage = SUPPORTED_LANGUAGES[targetLang]
            ?: throw IllegalArgumentException("Unsupported language: $targetLang. Supported: ${SUPPORTED_LANGUAGES.keys}")
        checkQuota("translate content")
        return try {
            val result = chatClient
                .prompt()
                .user { u ->
                    u
                        .text(translatePrompt)
                        .param("content", content)
                        .param("targetLanguage", targetLanguage)
                }.call()
                .content()
            TextAiResult(content = result ?: content, aiApplied = result != null)
        } catch (e: Exception) {
            logger.error(e) { "Failed to translate content, returning original" }
            TextAiResult(content = content, aiApplied = false)
        }
    }

    /**
     * Generative operation: generates writing prompts.
     * Throws on failure — callers should handle or let GlobalExceptionHandler convert to 500.
     */
    fun generatePrompts(
        templateType: String,
        existingContent: String?,
    ): List<String> {
        checkQuota("generate prompts")
        val existingSection = if (!existingContent.isNullOrBlank()) {
            "\nThey have already written: \"${existingContent.take(200)}...\""
        } else {
            ""
        }
        val result = chatClient
            .prompt()
            .user { u ->
                u
                    .text(generatePromptsPrompt)
                    .param("templateType", templateType)
                    .param("existingContentSection", existingSection)
            }.call()
            .entity(GeminiPromptsOutput::class.java)
        return result?.prompts ?: emptyList()
    }

    /**
     * Generative operation: generates directory entry content.
     * Throws on failure — callers should handle or let GlobalExceptionHandler convert to 500.
     */
    fun generateDirectoryContent(
        name: String,
        category: String,
    ): GeminiDirectoryContentOutput {
        checkQuota("generate directory content")
        return chatClient
            .prompt()
            .user { u ->
                u
                    .text(directoryContentPrompt)
                    .param("name", name)
                    .param("category", category)
            }.call()
            .entity(GeminiDirectoryContentOutput::class.java)
            ?: throw IllegalStateException("AI returned null directory content for '$name'")
    }

    private fun checkQuota(operation: String) {
        if (!apiUsageService.checkAndIncrementQuota("gemini-text", textMonthlyLimit)) {
            logger.warn { "Text AI quota exceeded for $operation" }
            throw RateLimitExceededException("Text AI monthly quota exceeded. Please try again next month.")
        }
    }
}
