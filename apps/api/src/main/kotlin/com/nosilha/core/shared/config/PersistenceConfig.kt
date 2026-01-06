package com.nosilha.core.shared.config

import jakarta.persistence.EntityManagerFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.orm.jpa.JpaTransactionManager

/**
 * Configuration class to explicitly enable and configure JPA repositories.
 *
 * <p>This configuration specifies which packages contain JPA repositories,
 * ensuring proper Spring Data JPA integration across all modules.</p>
 */
@Configuration
@EnableJpaRepositories(
    basePackages = [
        "com.nosilha.core.auth.repository",
        "com.nosilha.core.places.repository",
        "com.nosilha.core.engagement.repository",
        "com.nosilha.core.stories.repository",
        "com.nosilha.core.feedback.repository",
        "com.nosilha.core.gallery.repository",
    ],
)
class PersistenceConfig {
    /**
     * Defines the primary transaction manager for the application.
     */
    @Bean
    @Primary
    fun transactionManager(entityManagerFactory: EntityManagerFactory): JpaTransactionManager = JpaTransactionManager(entityManagerFactory)
}
