package com.nosilha.core.ai.provider

import com.google.cloud.vision.v1.AnnotateImageRequest
import com.google.cloud.vision.v1.Feature
import com.google.cloud.vision.v1.Image
import com.google.cloud.vision.v1.ImageAnnotatorClient
import com.google.cloud.vision.v1.ImageSource
import com.nosilha.core.ai.domain.AnalysisCapability
import com.nosilha.core.ai.domain.ImageAnalysisProvider
import com.nosilha.core.ai.domain.ImageAnalysisRequest
import com.nosilha.core.ai.domain.ImageAnalysisResult
import com.nosilha.core.ai.domain.LabelResult
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component

private val logger = KotlinLogging.logger {}

/**
 * Google Cloud Vision provider for structured image analysis.
 *
 * Provides label detection, OCR, and landmark detection.
 * Activated conditionally via `nosilha.ai.cloud-vision.enabled`.
 */
@Component
@ConditionalOnProperty("nosilha.ai.cloud-vision.enabled", havingValue = "true")
class CloudVisionProvider(
    @Value("\${nosilha.ai.cloud-vision.max-labels:10}")
    private val maxLabels: Int,
    @Value("\${nosilha.ai.cloud-vision.max-text-results:5}")
    private val maxTextResults: Int,
    @Value("\${nosilha.ai.cloud-vision.max-landmark-results:5}")
    private val maxLandmarkResults: Int,
) : ImageAnalysisProvider {
    override val name: String = "cloud-vision"

    override fun isEnabled(): Boolean = true

    override fun supports(): Set<AnalysisCapability> =
        setOf(AnalysisCapability.LABELS, AnalysisCapability.OCR, AnalysisCapability.LANDMARKS)

    override fun analyze(request: ImageAnalysisRequest): ImageAnalysisResult {
        logger.info { "Cloud Vision analyzing media ${request.mediaId}" }

        val image = Image
            .newBuilder()
            .setSource(ImageSource.newBuilder().setImageUri(request.imageUrl).build())
            .build()

        val features = listOf(
            Feature
                .newBuilder()
                .setType(Feature.Type.LABEL_DETECTION)
                .setMaxResults(maxLabels)
                .build(),
            Feature
                .newBuilder()
                .setType(Feature.Type.TEXT_DETECTION)
                .setMaxResults(maxTextResults)
                .build(),
            Feature
                .newBuilder()
                .setType(Feature.Type.LANDMARK_DETECTION)
                .setMaxResults(maxLandmarkResults)
                .build(),
        )

        val annotateRequest = AnnotateImageRequest
            .newBuilder()
            .setImage(image)
            .addAllFeatures(features)
            .build()

        val response = ImageAnnotatorClient.create().use { client ->
            client.batchAnnotateImages(listOf(annotateRequest))
        }

        val result = response.responsesList.firstOrNull()
            ?: return ImageAnalysisResult(provider = name, rawJson = "{}")

        if (result.hasError()) {
            logger.error { "Cloud Vision error: ${result.error.message}" }
            throw RuntimeException("Cloud Vision API error: ${result.error.message}")
        }

        val labels = result.labelAnnotationsList.map { annotation ->
            LabelResult(label = annotation.description, confidence = annotation.score)
        }

        val textDetected = result.textAnnotationsList
            .take(maxTextResults)
            .map { it.description }

        val landmarks = result.landmarkAnnotationsList.map { it.description }

        logger.info {
            "Cloud Vision results for ${request.mediaId}: " +
                "${labels.size} labels, ${textDetected.size} text, ${landmarks.size} landmarks"
        }

        return ImageAnalysisResult(
            provider = name,
            labels = labels,
            textDetected = textDetected,
            landmarks = landmarks,
            rawJson = result.toString(),
        )
    }
}
