package com.nosilha.core.shared.config

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.domain.AuditorAware
import org.springframework.data.jpa.repository.config.EnableJpaAuditing
import org.springframework.security.core.context.SecurityContextHolder
import java.util.Optional
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * Configures Spring Data JPA Auditing with Supabase-based auditor resolution.
 *
 * <p>The {@link AuditorAware} bean resolves the current user UUID from the
 * Spring Security context. Returns {@link Optional#empty()} when no authenticated
 * user is present (e.g., event handlers, system operations, public endpoints).</p>
 */
@Configuration
@EnableJpaAuditing
class JpaAuditingConfig {
    @Bean
    fun auditorAware(): AuditorAware<UUID> =
        AuditorAware {
            val authentication = SecurityContextHolder.getContext().authentication
            if (authentication == null || !authentication.isAuthenticated || authentication.name == "anonymousUser") {
                Optional.empty()
            } else {
                try {
                    Optional.of(UUID.fromString(authentication.name))
                } catch (e: IllegalArgumentException) {
                    logger.warn { "Could not parse authentication name as UUID: ${authentication.name}" }
                    Optional.empty()
                }
            }
        }
}
