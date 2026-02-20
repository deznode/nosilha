package com.nosilha.core.ai.domain

import com.nosilha.core.ai.repository.AiFeatureConfigRepository
import com.nosilha.core.shared.exception.ResourceNotFoundException
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * Manages AI feature toggles: global master switch and per-domain configs.
 *
 * <p>Provides read/write access to AI feature configs for the global toggle
 * and per domain (gallery, stories, directory). Used by controllers for CRUD
 * and by domain services for guard checks.</p>
 *
 * <p>Guard logic uses {@link #isOperational(String)} which enforces
 * the chain: global enabled AND domain enabled.</p>
 */
@Service
@Transactional(readOnly = true)
class AiFeatureConfigService(
    private val repository: AiFeatureConfigRepository,
    @Value("\${nosilha.ai.enabled:false}")
    private val aiEnabledProperty: Boolean,
) {
    companion object {
        const val GLOBAL_DOMAIN = "global"
    }

    /**
     * Returns all configs (including global) ordered by domain name.
     */
    fun getAllConfigs(): List<AiFeatureConfig> = repository.findAllByOrderByDomain()

    /**
     * Returns domain-level configs only (excludes global), for domain toggle display.
     */
    fun getDomainConfigs(): List<AiFeatureConfig> = repository.findAllByOrderByDomain().filter { it.domain != GLOBAL_DOMAIN }

    /**
     * Whether AI is globally enabled. Falls back to property if DB row is missing.
     */
    fun isGloballyEnabled(): Boolean =
        repository.findByDomain(GLOBAL_DOMAIN)?.enabled ?: run {
            logger.warn { "Global AI config not found, falling back to property: $aiEnabledProperty" }
            aiEnabledProperty
        }

    /**
     * Checks if AI is enabled for the given domain (domain-level only).
     *
     * <p>Returns false for unknown domains (fail-closed for safety).</p>
     */
    fun isEnabled(domain: String): Boolean =
        repository.findByDomain(domain)?.enabled ?: run {
            logger.warn { "AI feature config not found for domain '$domain', defaulting to disabled" }
            false
        }

    /**
     * Checks if AI is operationally enabled for a domain: global AND domain must both be enabled.
     *
     * <p>This is the method guard logic should use.</p>
     */
    fun isOperational(domain: String): Boolean = isGloballyEnabled() && isEnabled(domain)

    /**
     * Updates the enabled state for a domain's AI features.
     * Works for both global and domain-level configs.
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
