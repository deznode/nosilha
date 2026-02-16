package com.nosilha.core.ai.domain

/**
 * Text AI prompt templates for Cape Verdean cultural content operations.
 *
 * These prompts guide Gemini to process user-submitted text while preserving
 * authentic Cape Verdean voice, cultural terms, and storytelling style.
 */
object TextPromptTemplates {
    /**
     * Prompt for polishing story content — grammar and flow while preserving voice.
     */
    fun polishPrompt(content: String): String =
        """
        |You are a helpful editor for a cultural heritage platform called "Nos Ilha" (Cape Verde).
        |Please polish the following user-submitted story for grammar and flow while preserving:
        |- The authentic voice and personal perspective
        |- Nostalgic emotion (sodade)
        |- Cultural terms in Kriolu or Portuguese (like 'morna', 'cachupa', 'grogue', 'batuku')
        |- Regional expressions and idioms
        |- The storyteller's unique style
        |
        |Make minimal changes - only fix clear errors and improve readability. Do not add content or change the meaning.
        |
        |Original Text:
        |$content
        |
        |Return only the polished text, nothing else.
        """.trimMargin()

    /**
     * Prompt for translating content between Portuguese and English.
     */
    fun translatePrompt(
        content: String,
        targetLang: String,
    ): String {
        val targetLanguage = if (targetLang == "PT") "Portuguese" else "English"
        return """
            |Translate the following cultural text to $targetLanguage.
            |Maintain the emotional tone and keep specific Cape Verdean cultural terms in their original Kriolu form when applicable.
            |Cultural terms to preserve include: morna, sodade, cachupa, grogue, batuku, funana, coladeira, morabeza.
            |
            |Text:
            |$content
            |
            |Return only the translated text, nothing else.
            """.trimMargin()
    }

    /**
     * Prompt for generating follow-up writing prompts.
     */
    fun generatePromptsPrompt(
        templateType: String,
        existingContent: String?,
    ): String {
        val existingPart = if (!existingContent.isNullOrBlank()) {
            "\nThey have already written: \"${existingContent.take(200)}...\""
        } else {
            ""
        }
        return """
            |You are helping someone write a personal story about Brava Island, Cape Verde for a cultural heritage platform.
            |The story type is: $templateType$existingPart
            |
            |Generate 3 thoughtful follow-up questions or prompts to help them continue their story.
            |These should be personal and emotional, encouraging them to share specific memories.
            |
            |Return each prompt on a new line, numbered 1-3.
            """.trimMargin()
    }

    /**
     * Prompt for generating directory entry description and tags.
     */
    fun directoryContentPrompt(
        name: String,
        category: String,
    ): String =
        """
        |You are helping document a cultural heritage directory for Brava Island, Cape Verde.
        |
        |Generate a high-quality 2-3 sentence description and 5 relevant cultural tags for a $category in Brava, Cape Verde named "$name".
        |
        |The description should:
        |- Capture the authentic Cape Verdean atmosphere
        |- Be inviting and culturally respectful
        |- Mention relevant cultural elements when appropriate (e.g., morna music, Kriolu language, local cuisine)
        |
        |The tags should be relevant for discovery and SEO, like: traditional, ocean-view, family-owned, live-music, historical, hidden-gem
        """.trimMargin()
}
