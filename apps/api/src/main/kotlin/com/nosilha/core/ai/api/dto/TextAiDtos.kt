package com.nosilha.core.ai.api.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

data class PolishContentRequest(
    @field:NotBlank
    @field:Size(max = 10000, message = "Content must not exceed 10,000 characters")
    val content: String,
)

data class PolishContentResponse(
    val content: String,
    val aiApplied: Boolean,
)

data class TranslateContentRequest(
    @field:NotBlank
    @field:Size(max = 10000, message = "Content must not exceed 10,000 characters")
    val content: String,
    @field:NotBlank
    @field:Pattern(regexp = "^(EN|PT|KEA|FR)$", message = "Supported languages: EN, PT, KEA, FR")
    val targetLang: String,
)

data class TranslateContentResponse(
    val content: String,
    val aiApplied: Boolean,
)

data class GeneratePromptsRequest(
    @field:NotBlank
    val templateType: String,
    @field:Size(max = 5000, message = "Existing content must not exceed 5,000 characters")
    val existingContent: String? = null,
)

data class GeneratePromptsResponse(
    val prompts: List<String>,
)

data class GenerateDirectoryContentRequest(
    @field:NotBlank
    @field:Size(max = 200, message = "Name must not exceed 200 characters")
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
