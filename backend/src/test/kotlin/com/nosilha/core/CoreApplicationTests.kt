package com.nosilha.core

import com.google.cloud.storage.Storage
import com.nosilha.core.repository.firestore.ImageMetadataRepository
import com.nosilha.core.service.AIService
import org.junit.jupiter.api.Test
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource

@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@EnableAutoConfiguration(exclude = [
    com.google.cloud.spring.autoconfigure.storage.GcpStorageAutoConfiguration::class,
    com.google.cloud.spring.autoconfigure.firestore.GcpFirestoreAutoConfiguration::class,
    com.google.cloud.spring.autoconfigure.vision.CloudVisionAutoConfiguration::class
])
@TestPropertySource(properties = [
    "spring.main.allow-bean-definition-overriding=true"
])
class CoreApplicationTests {

    @MockBean
    private lateinit var storage: Storage

    @MockBean
    private lateinit var aiService: AIService

    @MockBean
    private lateinit var imageMetadataRepository: ImageMetadataRepository

    @Test
    fun contextLoads() {
        // This test ensures that the Spring context can load with test configuration
        // providing mock beans for GCP services
    }
}
