package com.nosilha.core.ai.domain

import java.util.UUID

/**
 * Request data for image analysis.
 *
 * @property mediaId the gallery media ID being analyzed
 * @property imageUrl publicly accessible URL of the image to analyze
 * @property capabilities requested analysis capabilities (empty = all supported by provider)
 * @property culturalContext optional cultural context hint (e.g., location, category)
 * @property priorResults results from a previous provider to enrich context (e.g., Cloud Vision → Gemini)
 */
data class ImageAnalysisRequest(
    val mediaId: UUID,
    val imageUrl: String,
    val capabilities: Set<AnalysisCapability> = emptySet(),
    val culturalContext: String? = null,
    val priorResults: ImageAnalysisResult? = null,
)
