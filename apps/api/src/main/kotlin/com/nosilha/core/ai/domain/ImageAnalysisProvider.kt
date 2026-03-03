package com.nosilha.core.ai.domain

/**
 * Abstraction for image analysis providers.
 *
 * <p>Extends {@link AiProvider} with image-specific operations.
 * Each provider (Cloud Vision, Gemini, etc.) implements this interface.
 * Providers are activated conditionally via {@code @ConditionalOnProperty} and
 * can be individually toggled via configuration.</p>
 *
 * @see com.nosilha.core.ai.provider.CloudVisionProvider
 * @see com.nosilha.core.ai.provider.GeminiCulturalProvider
 */
interface ImageAnalysisProvider : AiProvider {
    /** Returns the set of typed capabilities this provider supports. */
    fun supports(): Set<AnalysisCapability>

    /** Maps typed capabilities to string names for health reporting. */
    override fun capabilities(): Set<String> = supports().map { it.name }.toSet()

    /**
     * Analyze an image and return results.
     *
     * @param request the analysis request containing image URL and context
     * @return analysis results from this provider
     * @throws Exception if the provider encounters an unrecoverable error
     */
    fun analyze(request: ImageAnalysisRequest): ImageAnalysisResult
}
