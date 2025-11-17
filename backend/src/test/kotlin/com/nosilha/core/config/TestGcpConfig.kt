package com.nosilha.core.config

import com.google.cloud.firestore.Firestore
import com.google.cloud.storage.Storage
import org.mockito.Mockito
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import org.springframework.context.annotation.Profile

/**
 * Test configuration for GCP services (Firestore and Cloud Storage).
 *
 * This configuration provides mock implementations of GCP beans for tests
 * that need to load the full Spring Boot context but don't require actual
 * GCP services.
 *
 * Benefits:
 * 1. Tests can run without GCP credentials
 * 2. No need for GCP emulators in basic integration tests
 * 3. Spring context loads successfully with all dependencies satisfied
 *
 * Tests that need actual GCP functionality can:
 * - Configure emulators explicitly
 * - Override these beans with real implementations
 * - Use @MockBean to customize behavior
 */
@TestConfiguration
@Profile("test")
class TestGcpConfig {
    /**
     * Provides a mock Firestore bean for tests.
     * This prevents NoSuchBeanDefinitionException when GCP auto-configuration is excluded.
     */
    @Bean
    @Primary
    @ConditionalOnMissingBean(Firestore::class)
    fun mockFirestore(): Firestore = Mockito.mock(Firestore::class.java)

    /**
     * Provides a mock Storage bean for tests.
     * This prevents NoSuchBeanDefinitionException when GCP auto-configuration is excluded.
     */
    @Bean
    @Primary
    @ConditionalOnMissingBean(Storage::class)
    fun mockStorage(): Storage = Mockito.mock(Storage::class.java)
}
