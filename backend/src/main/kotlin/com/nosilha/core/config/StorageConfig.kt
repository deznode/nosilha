package com.nosilha.core.config

import com.google.cloud.storage.Storage
import com.google.cloud.storage.StorageOptions
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class StorageConfig {
  @Bean
  fun storage(): Storage = StorageOptions.getDefaultInstance().service
}