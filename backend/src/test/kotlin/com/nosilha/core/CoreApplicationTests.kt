package com.nosilha.core

import com.nosilha.core.config.TestConfig
import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Import(TestConfig::class)
class CoreApplicationTests {
    @Test
    fun contextLoads() {
        // This test ensures that the Spring context can load with test configuration
        // providing mock beans for GCP services
    }
}
