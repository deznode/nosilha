package com.nosilha.core

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

/**
 * Basic integration test to verify Spring Boot application context loads successfully.
 *
 * Note: GCP services (FileStorageService, AIService, ImageMetadataRepository) are disabled
 * in test profile via gcp.enabled=false in application-test.yml. This prevents these
 * components from loading and requiring GCP credentials or emulator setup.
 *
 * Tests that specifically need GCP services can:
 * 1. Set gcp.enabled=true in their test configuration
 * 2. Configure emulators (Firestore, Storage, Vision AI)
 * 3. Provide real GCP credentials
 */
@ActiveProfiles("test")
@SpringBootTest
class CoreApplicationTests {
    @Test
    fun contextLoads() {
        // This test verifies that the Spring application context loads successfully
        // without errors. It's a smoke test for configuration issues.
    }
}
