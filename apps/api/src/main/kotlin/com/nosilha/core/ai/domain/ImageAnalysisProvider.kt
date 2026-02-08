package com.nosilha.core.ai.domain

/**
 * Abstraction for image analysis providers.
 *
 * Each provider (Cloud Vision, Gemini, etc.) implements this interface.
 * Providers are activated conditionally via `@ConditionalOnProperty` and
 * can be individually toggled via configuration.
 *
 * @see com.nosilha.core.ai.provider.CloudVisionProvider
 * @see com.nosilha.core.ai.provider.GeminiCulturalProvider
 */
interface ImageAnalysisProvider {
    /** Unique name identifying this provider (e.g., "cloud-vision", "gemini-cultural"). */
    val name: String

    /** Whether this provider is currently enabled via configuration. */
    fun isEnabled(): Boolean

    /** Returns the set of capabilities this provider supports. */
    fun supports(): Set<AnalysisCapability>

    /**
     * Analyze an image and return results.
     *
     * @param request the analysis request containing image URL and context
     * @return analysis results from this provider
     * @throws Exception if the provider encounters an unrecoverable error
     */
    fun analyze(request: ImageAnalysisRequest): ImageAnalysisResult
}
