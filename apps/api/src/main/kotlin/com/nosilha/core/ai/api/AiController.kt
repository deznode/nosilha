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
 * <p>Provides content polishing, translation, story prompt generation, and
 * directory content generation. All endpoints require authenticated user.</p>
 *
 * <p>Enhancement operations (polish, translate) return {@code aiApplied} flag
 * to indicate whether AI processing was applied. Generative operations
 * (prompts, directory-content) propagate errors when AI is unavailable.</p>
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
    ): ApiResult<PolishContentResponse> {
        val provider = textAiProvider
        if (provider == null) {
            logger.debug { "Text AI unavailable, returning original content" }
            return ApiResult(data = PolishContentResponse(content = request.content, aiApplied = false))
        }
        val result = provider.polishContent(request.content)
        return ApiResult(data = PolishContentResponse(content = result.content, aiApplied = result.aiApplied))
    }

    @PostMapping("/translate")
    fun translateContent(
        @Valid @RequestBody request: TranslateContentRequest,
    ): ApiResult<TranslateContentResponse> {
        val provider = textAiProvider
        if (provider == null) {
            logger.debug { "Text AI unavailable, returning original content" }
            return ApiResult(data = TranslateContentResponse(content = request.content, aiApplied = false))
        }
        val result = provider.translateContent(request.content, request.targetLang)
        return ApiResult(data = TranslateContentResponse(content = result.content, aiApplied = result.aiApplied))
    }

    @PostMapping("/prompts")
    fun generatePrompts(
        @Valid @RequestBody request: GeneratePromptsRequest,
    ): ApiResult<GeneratePromptsResponse> {
        val provider = textAiProvider
            ?: throw IllegalStateException("Text AI is not available. Enable Gemini to use this feature.")
        val prompts = provider.generatePrompts(request.templateType, request.existingContent)
        return ApiResult(data = GeneratePromptsResponse(prompts = prompts))
    }

    @PostMapping("/directory-content")
    fun generateDirectoryContent(
        @Valid @RequestBody request: GenerateDirectoryContentRequest,
    ): ApiResult<DirectoryContentResponse> {
        val provider = textAiProvider
            ?: throw IllegalStateException("Text AI is not available. Enable Gemini to use this feature.")
        val result = provider.generateDirectoryContent(request.name, request.category)
        return ApiResult(data = DirectoryContentResponse(description = result.description, tags = result.tags))
    }
}
