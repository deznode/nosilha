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
        "com.nosilha.core.directory.repository",
        "com.nosilha.core.contentactions.repository",
        "com.nosilha.core.media.repository",
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
