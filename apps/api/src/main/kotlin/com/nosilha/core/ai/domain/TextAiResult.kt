package com.nosilha.core.ai.domain

/**
 * Result of an enhancement text AI operation (polish, translate).
 *
 * @property content The resulting content (AI-processed or original fallback)
 * @property aiApplied Whether AI processing was successfully applied.
 *   false when AI call failed and original content was returned as fallback.
 */
data class TextAiResult(
    val content: String,
    val aiApplied: Boolean,
)
