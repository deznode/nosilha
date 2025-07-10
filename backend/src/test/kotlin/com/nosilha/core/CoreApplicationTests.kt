package com.nosilha.core

import com.nosilha.core.config.TestConfig
import org.junit.jupiter.api.Test
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@EnableAutoConfiguration(exclude = [
    com.google.cloud.spring.autoconfigure.storage.GcpStorageAutoConfiguration::class,
    com.google.cloud.spring.autoconfigure.firestore.GcpFirestoreAutoConfiguration::class,
    com.google.cloud.spring.autoconfigure.vision.CloudVisionAutoConfiguration::class
])
@Import(TestConfig::class)
class CoreApplicationTests {
    @Test
    fun contextLoads() {
    }
}
