package com.nosilha.core.ai.domain

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.JsonPropertyOrder

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
