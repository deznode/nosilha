package com.nosilha.core.ai.api.dto

import jakarta.validation.constraints.NotBlank

data class PolishContentRequest(
    @field:NotBlank
    val content: String,
)

data class PolishContentResponse(
    val content: String,
)

data class TranslateContentRequest(
    @field:NotBlank
    val content: String,
    @field:NotBlank
    val targetLang: String,
)

data class TranslateContentResponse(
    val content: String,
)

data class GeneratePromptsRequest(
    @field:NotBlank
    val templateType: String,
    val existingContent: String? = null,
)

data class GeneratePromptsResponse(
    val prompts: List<String>,
)

data class GenerateDirectoryContentRequest(
    @field:NotBlank
    val name: String,
    @field:NotBlank
    val category: String,
)

data class DirectoryContentResponse(
    val description: String,
    val tags: List<String>,
)

data class AiAvailableResponse(
    val available: Boolean,
)
