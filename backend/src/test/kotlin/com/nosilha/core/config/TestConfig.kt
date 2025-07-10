package com.nosilha.core.config

import com.google.cloud.storage.Storage
import com.nosilha.core.repository.firestore.ImageMetadataRepository
import com.nosilha.core.service.AIService
import org.mockito.Mockito
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import org.springframework.test.context.ActiveProfiles

/**
 * Test configuration that provides mock beans for GCP services
 * This prevents the need for real GCP credentials during testing
 */
@TestConfiguration
@ActiveProfiles("test")
class TestConfig {

    @Bean
    @Primary
    fun mockStorage(): Storage {
        return Mockito.mock(Storage::class.java)
    }

    @Bean
    @Primary  
    fun mockAIService(): AIService {
        return Mockito.mock(AIService::class.java)
    }

    @Bean
    @Primary
    fun mockImageMetadataRepository(): ImageMetadataRepository {
        return Mockito.mock(ImageMetadataRepository::class.java)
    }
}