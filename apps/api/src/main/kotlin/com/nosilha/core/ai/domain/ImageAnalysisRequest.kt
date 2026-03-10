package com.nosilha.core.ai.domain

import java.util.UUID

/**
 * Request data for image analysis.
 *
 * @property mediaId the gallery media ID being analyzed
 * @property imageUrl publicly accessible URL of the image to analyze
 * @property capabilities requested analysis capabilities (empty = all supported by provider)
 * @property culturalContext optional cultural context hint (e.g., media title)
 * @property locationContext optional location hint (e.g., "Nova Sintra, Brava")
 * @property category optional media category (e.g., "heritage", "nature", "food")
 * @property approximateDate optional free-text historical date (e.g., "circa 1960s")
 * @property priorResults results from a previous provider to enrich context (e.g., Cloud Vision → Gemini)
 */
data class ImageAnalysisRequest(
    val mediaId: UUID,
    val imageUrl: String,
    val capabilities: Set<AnalysisCapability> = emptySet(),
    val culturalContext: String? = null,
    val locationContext: String? = null,
    val category: String? = null,
    val approximateDate: String? = null,
    val priorResults: ImageAnalysisResult? = null,
)
