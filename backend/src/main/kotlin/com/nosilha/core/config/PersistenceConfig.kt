package com.nosilha.core.config

import com.google.cloud.spring.data.firestore.repository.config.EnableReactiveFirestoreRepositories
import jakarta.persistence.EntityManagerFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.orm.jpa.JpaTransactionManager

/**
 * Configuration class to explicitly enable and configure JPA and Firestore repositories.
 *
 * This configuration is necessary in a multi-datastore application to tell Spring
 * which repositories belong to which data technology, preventing conflicts.
 */
@Configuration
@EnableJpaRepositories(basePackages = ["com.nosilha.core.repository.jpa"])
@EnableReactiveFirestoreRepositories(basePackages = ["com.nosilha.core.repository.firestore"])
class PersistenceConfig {

    /**
     * Defines the primary transaction manager for the application.
     * By annotating this with @Primary, we tell Spring to use the JPA transaction
     * manager by default for any @Transactional method that doesn't specify one.
     * This resolves the conflict with the reactive Firestore transaction manager.
     */
    @Bean
    @Primary
    fun transactionManager(entityManagerFactory: EntityManagerFactory): JpaTransactionManager {
        return JpaTransactionManager(entityManagerFactory)
    }
}
