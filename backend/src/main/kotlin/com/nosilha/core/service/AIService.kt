package com.nosilha.core.service

import com.google.cloud.vision.v1.AnnotateImageRequest
import com.google.cloud.vision.v1.Feature
import com.google.cloud.vision.v1.Image
import com.google.cloud.vision.v1.ImageAnnotatorClient
import com.google.cloud.vision.v1.ImageSource
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class AIService {
    private val logger = LoggerFactory.getLogger(AIService::class.java)

    /**
     * Analyzes an image stored in GCS using the Vision AI API to generate descriptive tags.
     *
     * @param gcsPath The full GCS path to the image (e.g., "gs://bucket-name/image.jpg").
     * @return A list of tag descriptions with a confidence score greater than 0.85.
     */
    fun generateTagsForImage(gcsPath: String): List<String> {
        logger.info("Generating tags for image: $gcsPath")

        try {
            // The .use block ensures the client is automatically closed after use.
            ImageAnnotatorClient.create().use { imageAnnotatorClient ->

                // Build the image representation from the GCS path
                val source = ImageSource.newBuilder().setImageUri(gcsPath).build()
                val image = Image.newBuilder().setSource(source).build()

                // Specify the feature type (LABEL_DETECTION)
                val feature = Feature.newBuilder().setType(Feature.Type.LABEL_DETECTION).build()

                // Build the request
                val request =
                    AnnotateImageRequest.newBuilder()
                        .addFeatures(feature)
                        .setImage(image)
                        .build()

                // Send the request to the Vision AI API
                val response = imageAnnotatorClient.batchAnnotateImages(listOf(request))

                // Parse the response and extract high-confidence labels
                return response.responsesList.firstOrNull()?.labelAnnotationsList
                    ?.filter { it.score > 0.85f } // Filter for labels with high confidence
                    ?.map { it.description } // Extract the text description
                    ?: emptyList()
            }
        } catch (e: Exception) {
            logger.error("Failed to analyze image with Vision AI: ${e.message}", e)
            return emptyList() // Return an empty list in case of an error
        }
    }
}
