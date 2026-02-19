package com.nosilha.core.ai.domain

import com.nosilha.core.ai.repository.AiFeatureConfigRepository
import com.nosilha.core.shared.exception.ResourceNotFoundException
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * Manages domain-level AI feature toggles.
 *
 * <p>Provides read/write access to AI feature configs per domain
 * (gallery, stories, directory). Used by controllers for CRUD and
 * by domain services for guard checks.</p>
 */
@Service
@Transactional(readOnly = true)
class AiFeatureConfigService(
    private val repository: AiFeatureConfigRepository,
) {
    /**
     * Returns all domain configs ordered by domain name.
     */
    fun getAllConfigs(): List<AiFeatureConfig> = repository.findAllByOrderByDomain()

    /**
     * Checks if AI is enabled for the given domain.
     *
     * <p>Returns false for unknown domains (fail-closed for safety).</p>
     */
    fun isEnabled(domain: String): Boolean {
        val config = repository.findByDomain(domain)
        if (config == null) {
            logger.warn { "AI feature config not found for domain '$domain', defaulting to disabled" }
            return false
        }
        return config.enabled
    }

    /**
     * Updates the enabled state for a domain's AI features.
     *
     * @throws ResourceNotFoundException if the domain does not exist
     */
    @Transactional
    fun updateConfig(
        domain: String,
        enabled: Boolean,
        adminId: UUID,
    ): AiFeatureConfig {
        val config = repository.findByDomain(domain)
            ?: throw ResourceNotFoundException("AI feature config for domain '$domain' not found.")
        config.enabled = enabled
        logger.info { "Admin $adminId toggled AI for domain '$domain' to enabled=$enabled" }
        return repository.save(config)
    }
}
