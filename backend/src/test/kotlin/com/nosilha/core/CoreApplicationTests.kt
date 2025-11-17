package com.nosilha.core

import com.google.cloud.spring.autoconfigure.core.GcpContextAutoConfiguration
import com.google.cloud.spring.autoconfigure.firestore.GcpFirestoreAutoConfiguration
import com.google.cloud.spring.autoconfigure.storage.GcpStorageAutoConfiguration
import com.google.cloud.spring.autoconfigure.vision.CloudVisionAutoConfiguration
import com.nosilha.core.config.GcpMockConfiguration
import org.junit.jupiter.api.Test
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

/**
 * Basic integration test to verify Spring Boot application context loads successfully.
 *
 * Note: All GCP auto-configurations are excluded to prevent Spring Boot from trying to create
 * GCP infrastructure beans which require credentials. This includes:
 * - GcpContextAutoConfiguration (core GCP context)
 * - GcpFirestoreAutoConfiguration (Firestore)
 * - GcpStorageAutoConfiguration (Cloud Storage)
 * - CloudVisionAutoConfiguration (Vision API)
 *
 * GCP service dependencies (Storage, ImageAnnotatorClient) are mocked via GcpMockConfiguration,
 * allowing our custom GCP services to be instantiated without requiring actual GCP credentials.
 *
 * Tests that specifically need real GCP services can:
 * 1. Remove the exclusions
 * 2. Configure emulators (Firestore, Storage, Vision API)
 * 3. Provide real GCP credentials
 */
@ActiveProfiles("test")
@SpringBootTest
@EnableAutoConfiguration(
    exclude = [
        GcpContextAutoConfiguration::class,
        GcpFirestoreAutoConfiguration::class,
        GcpStorageAutoConfiguration::class,
        CloudVisionAutoConfiguration::class,
    ],
)
@Import(GcpMockConfiguration::class)
class CoreApplicationTests {
    @Test
    fun contextLoads() {
        // This test verifies that the Spring application context loads successfully
        // without errors. It's a smoke test for configuration issues.
    }
}
