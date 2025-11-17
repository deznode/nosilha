package com.nosilha.core

import com.google.cloud.spring.autoconfigure.firestore.GcpFirestoreAutoConfiguration
import com.google.cloud.spring.autoconfigure.storage.GcpStorageAutoConfiguration
import com.nosilha.core.config.TestGcpConfig
import org.junit.jupiter.api.Test
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

/**
 * Basic integration test to verify Spring Boot application context loads successfully.
 *
 * Note: GCP services (Firestore, Storage) are mocked using TestGcpConfig because:
 * 1. CI environment (GitHub Actions) doesn't have GCP credentials
 * 2. Emulators aren't running in test profile
 * 3. Tests that specifically need real GCP services can configure emulators individually
 *
 * This approach allows the full Spring context to load with all dependencies satisfied,
 * while avoiding the need for actual GCP credentials or emulator setup.
 */
@ActiveProfiles("test")
@SpringBootTest
@EnableAutoConfiguration(
    exclude = [
        GcpFirestoreAutoConfiguration::class,
        GcpStorageAutoConfiguration::class,
    ],
)
@Import(TestGcpConfig::class)
class CoreApplicationTests {
    @Test
    fun contextLoads() {
        // This test verifies that the Spring application context loads successfully
        // without errors. It's a smoke test for configuration issues.
    }
}
