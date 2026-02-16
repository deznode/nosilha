package com.nosilha.core.ai.api

import com.nosilha.core.ai.api.dto.AiAvailableResponse
import com.nosilha.core.ai.api.dto.DirectoryContentResponse
import com.nosilha.core.ai.api.dto.GenerateDirectoryContentRequest
import com.nosilha.core.ai.api.dto.GeneratePromptsRequest
import com.nosilha.core.ai.api.dto.GeneratePromptsResponse
import com.nosilha.core.ai.api.dto.PolishContentRequest
import com.nosilha.core.ai.api.dto.PolishContentResponse
import com.nosilha.core.ai.api.dto.TranslateContentRequest
import com.nosilha.core.ai.api.dto.TranslateContentResponse
import com.nosilha.core.ai.provider.TextAiProvider
import com.nosilha.core.shared.api.ApiResult
import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

private val logger = KotlinLogging.logger {}

/**
 * User-facing REST controller for text AI operations.
 *
 * Provides content polishing, translation, story prompt generation, and
 * directory content generation. All endpoints require authenticated user.
 * When Gemini is disabled, returns unavailable/fallback responses.
 */
@RestController
@RequestMapping("/api/v1/ai")
class AiController(
    private val textAiProvider: TextAiProvider?,
) {
    @GetMapping("/available")
    fun checkAvailable(): ApiResult<AiAvailableResponse> {
        val available = textAiProvider?.isAvailable() ?: false
        return ApiResult(data = AiAvailableResponse(available = available))
    }

    @PostMapping("/polish")
    fun polishContent(
        @Valid @RequestBody request: PolishContentRequest,
    ): ApiResult<PolishContentResponse> =
        withProviderOrFallback(PolishContentResponse(content = request.content)) { provider ->
            val polished = provider.polishContent(request.content)
            PolishContentResponse(content = polished)
        }

    @PostMapping("/translate")
    fun translateContent(
        @Valid @RequestBody request: TranslateContentRequest,
    ): ApiResult<TranslateContentResponse> =
        withProviderOrFallback(TranslateContentResponse(content = request.content)) { provider ->
            val translated = provider.translateContent(request.content, request.targetLang)
            TranslateContentResponse(content = translated)
        }

    @PostMapping("/prompts")
    fun generatePrompts(
        @Valid @RequestBody request: GeneratePromptsRequest,
    ): ApiResult<GeneratePromptsResponse> =
        withProviderOrFallback(GeneratePromptsResponse(prompts = emptyList())) { provider ->
            val prompts = provider.generatePrompts(request.templateType, request.existingContent)
            GeneratePromptsResponse(prompts = prompts)
        }

    @PostMapping("/directory-content")
    fun generateDirectoryContent(
        @Valid @RequestBody request: GenerateDirectoryContentRequest,
    ): ApiResult<DirectoryContentResponse> {
        val emptyResponse = DirectoryContentResponse(description = "", tags = emptyList())
        return withProviderOrFallback(emptyResponse) { provider ->
            val result = provider.generateDirectoryContent(request.name, request.category)
            result?.let { DirectoryContentResponse(description = it.description, tags = it.tags) } ?: emptyResponse
        }
    }

    /**
     * Executes an action with the text AI provider, returning [fallback] wrapped
     * in [ApiResult] when the provider is unavailable (Gemini disabled).
     */
    private fun <T> withProviderOrFallback(
        fallback: T,
        action: (TextAiProvider) -> T,
    ): ApiResult<T> {
        val provider = textAiProvider
        if (provider == null) {
            logger.debug { "Text AI unavailable, returning fallback response" }
            return ApiResult(data = fallback)
        }
        return ApiResult(data = action(provider))
    }
}
