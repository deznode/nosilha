package com.nosilha.core.config

import com.google.cloud.NoCredentials
import com.google.cloud.storage.Storage
import com.google.cloud.storage.StorageOptions
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile

@Configuration
@Profile("local")
class LocalStorageConfig(
    @Value("\${gcp.serverUrl}")
    private val fakeGcsExternalUrl: String,
) {
    @Bean
    fun storage(): Storage =
        StorageOptions
            .newBuilder()
            .setHost(fakeGcsExternalUrl)
            .setProjectId("test-project")
            .setCredentials(NoCredentials.getInstance())
            .build()
            .getService()
}
