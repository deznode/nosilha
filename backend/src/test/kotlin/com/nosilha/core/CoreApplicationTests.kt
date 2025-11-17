package com.nosilha.core

import com.google.cloud.spring.autoconfigure.core.GcpContextAutoConfiguration
import com.google.cloud.spring.autoconfigure.firestore.GcpFirestoreAutoConfiguration
import com.google.cloud.spring.autoconfigure.storage.GcpStorageAutoConfiguration
import com.google.cloud.spring.vision.CloudVisionAutoConfiguration
import org.junit.jupiter.api.Test
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

/**
 * Basic integration test to verify Spring Boot application context loads successfully.
 *
 * Note: All GCP auto-configurations are excluded to prevent Spring Boot from trying to create
 * GCP beans which require credentials. This includes:
 * - GcpContextAutoConfiguration (core GCP context)
 * - GcpFirestoreAutoConfiguration (Firestore)
 * - GcpStorageAutoConfiguration (Cloud Storage)
 * - CloudVisionAutoConfiguration (Vision API)
 *
 * Our custom GCP services (FileStorageService, AIService, ImageMetadataRepository,
 * FileUploadController) are also disabled via gcp.enabled=false in application-test.yml.
 *
 * Tests that specifically need GCP services can:
 * 1. Remove the exclusions
 * 2. Set gcp.enabled=true in their test configuration
 * 3. Configure emulators (Firestore, Storage, Vision API)
 * 4. Provide real GCP credentials
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
class CoreApplicationTests {
    @Test
    fun contextLoads() {
        // This test verifies that the Spring application context loads successfully
        // without errors. It's a smoke test for configuration issues.
    }
}
