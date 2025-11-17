package com.nosilha.core

import com.google.cloud.spring.autoconfigure.firestore.GcpFirestoreAutoConfiguration
import com.google.cloud.spring.autoconfigure.storage.GcpStorageAutoConfiguration
import org.junit.jupiter.api.Test
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

/**
 * Basic integration test to verify Spring Boot application context loads successfully.
 *
 * Note: GCP auto-configuration is excluded to prevent Spring Boot from trying to create
 * Firestore and Storage beans which require GCP credentials. Our custom GCP services
 * (FileStorageService, AIService, ImageMetadataRepository, FileUploadController) are
 * disabled via gcp.enabled=false in application-test.yml as a secondary safeguard.
 *
 * Tests that specifically need GCP services can:
 * 1. Remove the exclusions
 * 2. Set gcp.enabled=true in their test configuration
 * 3. Configure emulators (Firestore, Storage, Vision AI)
 * 4. Provide real GCP credentials
 */
@ActiveProfiles("test")
@SpringBootTest
@EnableAutoConfiguration(
    exclude = [
        GcpFirestoreAutoConfiguration::class,
        GcpStorageAutoConfiguration::class,
    ],
)
class CoreApplicationTests {
    @Test
    fun contextLoads() {
        // This test verifies that the Spring application context loads successfully
        // without errors. It's a smoke test for configuration issues.
    }
}
