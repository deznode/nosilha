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
    ): ApiResult<PolishContentResponse> {
        if (textAiProvider == null) {
            logger.debug { "Text AI unavailable, returning original content for polish" }
            return ApiResult(data = PolishContentResponse(content = request.content))
        }
        val polished = textAiProvider.polishContent(request.content)
        return ApiResult(data = PolishContentResponse(content = polished))
    }

    @PostMapping("/translate")
    fun translateContent(
        @Valid @RequestBody request: TranslateContentRequest,
    ): ApiResult<TranslateContentResponse> {
        if (textAiProvider == null) {
            logger.debug { "Text AI unavailable, returning original content for translate" }
            return ApiResult(data = TranslateContentResponse(content = request.content))
        }
        val translated = textAiProvider.translateContent(request.content, request.targetLang)
        return ApiResult(data = TranslateContentResponse(content = translated))
    }

    @PostMapping("/prompts")
    fun generatePrompts(
        @Valid @RequestBody request: GeneratePromptsRequest,
    ): ApiResult<GeneratePromptsResponse> {
        if (textAiProvider == null) {
            logger.debug { "Text AI unavailable, returning empty prompts" }
            return ApiResult(data = GeneratePromptsResponse(prompts = emptyList()))
        }
        val prompts = textAiProvider.generatePrompts(request.templateType, request.existingContent)
        return ApiResult(data = GeneratePromptsResponse(prompts = prompts))
    }

    @PostMapping("/directory-content")
    fun generateDirectoryContent(
        @Valid @RequestBody request: GenerateDirectoryContentRequest,
    ): ApiResult<DirectoryContentResponse> {
        if (textAiProvider == null) {
            logger.debug { "Text AI unavailable, returning empty directory content" }
            return ApiResult(data = DirectoryContentResponse(description = "", tags = emptyList()))
        }
        val result = textAiProvider.generateDirectoryContent(request.name, request.category)
        return if (result != null) {
            ApiResult(data = DirectoryContentResponse(description = result.description, tags = result.tags))
        } else {
            ApiResult(data = DirectoryContentResponse(description = "", tags = emptyList()))
        }
    }
}
