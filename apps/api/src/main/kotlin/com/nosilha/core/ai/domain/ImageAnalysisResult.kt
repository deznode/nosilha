package com.nosilha.core.ai.domain

/**
 * Result of image analysis from a single provider.
 *
 * @property provider name of the provider that produced these results
 * @property labels detected labels with confidence scores
 * @property textDetected text extracted via OCR (empty list if no text found)
 * @property landmarks detected geographic landmarks (empty list if none found)
 * @property title generated concise title for the image
 * @property altText generated accessible alt text for the image
 * @property description generated rich description of the image
 * @property tags generated semantic tags for categorization
 * @property rawJson raw JSON response from the provider for audit purposes
 */
data class ImageAnalysisResult(
    val provider: String,
    val labels: List<LabelResult> = emptyList(),
    val textDetected: List<String> = emptyList(),
    val landmarks: List<String> = emptyList(),
    val title: String? = null,
    val altText: String? = null,
    val description: String? = null,
    val tags: List<String> = emptyList(),
    val rawJson: String? = null,
)

/**
 * A detected label with its confidence score.
 *
 * @property label the detected label text
 * @property confidence confidence score from 0.0 to 1.0
 */
data class LabelResult(
    val label: String,
    val confidence: Float,
)
