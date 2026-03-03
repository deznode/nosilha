package com.nosilha.core.ai.domain

/**
 * Base interface for all AI providers (image analysis and text operations).
 *
 * <p>Provides a uniform contract for health reporting in the admin dashboard.
 * Specialized interfaces (e.g., {@link ImageAnalysisProvider}) extend this
 * with domain-specific operations.</p>
 *
 * @see ImageAnalysisProvider
 * @see com.nosilha.core.ai.provider.TextAiProvider
 */
interface AiProvider {
    /** Unique name identifying this provider (used as API usage key). */
    val name: String

    /** Monthly API usage limit for this provider. */
    val monthlyLimit: Int

    /** Whether this provider is currently enabled and able to accept requests. */
    fun isEnabled(): Boolean

    /** Returns capability names as strings for health reporting. */
    fun capabilities(): Set<String>
}
