package com.nosilha.core.media.domain

import com.google.cloud.vision.v1.AnnotateImageRequest
import com.google.cloud.vision.v1.Feature
import com.google.cloud.vision.v1.Image
import com.google.cloud.vision.v1.ImageAnnotatorClient
import com.google.cloud.vision.v1.ImageSource
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.stereotype.Service

/**
 * Service to handle interactions with the Google Cloud Vision AI API.
 */
@Service
class AIService {
    private val logger = KotlinLogging.logger {}

    /**
     * Analyzes an image in GCS to generate descriptive tags.
     *
     * @param gcsPath The full GCS path to the image (e.g., "gs://bucket-name/image.jpg").
     * @return A list of tag descriptions with a confidence score greater than 0.85.
     */
    fun generateTagsForImage(gcsPath: String): List<String> {
        logger.info { "Requesting AI analysis for image: $gcsPath" }
        val generatedTags = mutableListOf<String>()

        try {
            // The .use block properly closes the client after the operation.
            ImageAnnotatorClient.create().use { imageAnnotatorClient ->
                // Build the Image object from the GCS path
                val imageSource = ImageSource.newBuilder().setImageUri(gcsPath).build()
                val image = Image.newBuilder().setSource(imageSource).build()

                // Specify the LABEL_DETECTION feature
                val feature = Feature.newBuilder().setType(Feature.Type.LABEL_DETECTION).build()

                // Build the request
                val request =
                    AnnotateImageRequest
                        .newBuilder()
                        .addFeatures(feature)
                        .setImage(image)
                        .build()

                // Send the request
                val response = imageAnnotatorClient.batchAnnotateImages(listOf(request))

                // Parse the response and extract high-confidence labels
                val labels =
                    response.responsesList
                        .firstOrNull()
                        ?.labelAnnotationsList
                        ?.filter { it.score > 0.85f }
                        ?.map { it.description }
                        ?: emptyList()

                generatedTags.addAll(labels)
            }
        } catch (e: Exception) {
            logger.error(e) { "Error analyzing image with Vision AI: ${e.message}" }
            return emptyList()
        }

        logger.info { "Found ${generatedTags.size} high-confidence tags for $gcsPath." }
        logger.info { "Tags:  $generatedTags" }
        return generatedTags
    }
}
