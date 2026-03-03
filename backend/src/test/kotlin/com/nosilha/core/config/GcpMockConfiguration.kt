package com.nosilha.core.config

import com.google.cloud.storage.Storage
import com.google.cloud.vision.v1.ImageAnnotatorClient
import com.nosilha.core.media.repository.ImageMetadataRepository
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.test.mock.mockito.MockBean

/**
 * Test configuration that provides mock implementations of GCP services.
 *
 * This configuration is used in integration tests to avoid requiring actual GCP credentials
 * and infrastructure. Instead of modifying production code with @ConditionalOnProperty,
 * we use Spring's @MockBean to replace real GCP services with mocks in the test context.
 *
 * Usage: Add @Import(GcpMockConfiguration::class) to your test class.
 *
 * Benefits:
 * - Keeps production code clean (no test-specific annotations)
 * - Explicit about what's being mocked
 * - Centralized mock configuration for reusability
 * - Standard Spring Boot testing practice
 */
@TestConfiguration
class GcpMockConfiguration {
    /**
     * Mock for Google Cloud Storage client.
     * Prevents FileStorageService and LocalStorageConfig from requiring real GCS.
     */
    @MockBean
    lateinit var storage: Storage

    /**
     * Mock for Google Cloud Vision API client.
     * Prevents AIService from requiring real Vision API credentials.
     */
    @MockBean
    lateinit var imageAnnotatorClient: ImageAnnotatorClient

    /**
     * Mock for Firestore-backed ImageMetadataRepository.
     * Prevents Spring Data Firestore from requiring firestoreTemplate bean.
     */
    @MockBean
    lateinit var imageMetadataRepository: ImageMetadataRepository
}
