package com.nosilha.core.config

import com.google.cloud.spring.data.firestore.repository.config.EnableReactiveFirestoreRepositories
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

/**
 * Configuration class to explicitly enable and configure JPA and Firestore repositories.
 *
 * This configuration is necessary in a multi-datastore application to tell Spring
 * which repositories belong to which data technology, preventing conflicts.
 */
@Configuration
@EnableJpaRepositories(basePackages = ["com.nosilha.core.repository.jpa"])
@EnableReactiveFirestoreRepositories(basePackages = ["com.nosilha.core.repository.firestore"])
class PersistenceConfig