package com.nosilha.core

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

/**
 * Basic integration test to verify Spring Boot application context loads successfully.
 *
 * <p>This test uses Testcontainers for PostgreSQL and verifies that all Spring
 * beans are properly configured and can be instantiated.</p>
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
