package com.nosilha.core.ai.domain

/**
 * Cultural prompt templates for Brava Island heritage context.
 *
 * These prompts guide Gemini to generate culturally-aware descriptions
 * that recognize and celebrate Brava Island's unique heritage.
 */
object CulturalPromptTemplates {
    /**
     * Main analysis prompt for Gemini cultural context generation.
     *
     * @param priorLabels labels from Cloud Vision (if available)
     * @param priorLandmarks landmarks from Cloud Vision (if available)
     * @param mediaTitle optional title of the media
     * @param locationContext optional location hint
     */
    fun analysisPrompt(
        priorLabels: List<String> = emptyList(),
        priorLandmarks: List<String> = emptyList(),
        mediaTitle: String? = null,
        locationContext: String? = null,
    ): String {
        val contextParts = buildList {
            if (priorLabels.isNotEmpty()) add("Detected labels: ${priorLabels.joinToString(", ")}")
            if (priorLandmarks.isNotEmpty()) add("Detected landmarks: ${priorLandmarks.joinToString(", ")}")
            if (mediaTitle != null) add("Image title: $mediaTitle")
            if (locationContext != null) add("Location: $locationContext")
        }

        val priorContext = if (contextParts.isNotEmpty()) {
            "\n\nAdditional context from prior analysis:\n${contextParts.joinToString("\n")}"
        } else {
            ""
        }

        return """
            |You are an expert on Cape Verdean culture, specifically Brava Island heritage.
            |Analyze this image in the context of Brava Island, Cape Verde cultural heritage.
            |
            |Brava Island context:
            |- Smallest inhabited island in Cape Verde, known as "Island of Flowers"
            |- Main town: Nova Sintra, perched in a volcanic crater
            |- Key locations: Fajã d'Água (coastal village), Furna (port), Cachaço, Mato Grande
            |- Traditional architecture: colonial Portuguese buildings, cobblestone streets
            |- Volcanic landscape: lush green mountains, terraced hillsides
            |- Maritime heritage: whaling history, fishing traditions, diaspora connections
            |- Cultural traditions: morna music (Eugénio Tavares), coladeira, festivals
            |- Flora: bougainvillea, hibiscus, coffee plantations, dragon trees
            |- Cuisine: cachupa, grogue, local coffee
            |$priorContext
            |
            |Respond with ONLY a JSON object (no markdown, no code fences) with these fields:
            |{
            |  "altText": "A concise, accessible alt text for the image (max 150 chars)",
            |  "description": "A rich description highlighting cultural significance (max 500 chars)",
            |  "tags": ["tag1", "tag2", "tag3"]
            |}
            |
            |Guidelines:
            |- Alt text should be factual and accessible (for screen readers)
            |- Description should highlight cultural significance for Brava Island heritage
            |- Tags should include cultural terms, locations, and themes (5-10 tags)
            |- Use English for all text
            |- If the image does not appear related to Cape Verde/Brava, still describe it accurately
            """.trimMargin()
    }
}
