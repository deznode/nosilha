package com.nosilha.core.shared.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import tools.jackson.module.kotlin.KotlinFeature
import tools.jackson.module.kotlin.KotlinModule

/**
 * Jackson configuration for Kotlin idiomatic JSON handling.
 *
 * Enables NullIsSameAsDefault so missing/null JSON fields use Kotlin default parameter values.
 * This allows DTOs like:
 *   data class Request(val displayOrder: Int = 0)
 * to receive { } or {"displayOrder": null} and use the default value 0.
 *
 * Spring Boot 4.0's JacksonAutoConfiguration automatically registers all Module beans
 * with its ObjectMapper, so we just need to provide the configured module.
 */
@Configuration
class JacksonConfig {
    @Bean
    fun kotlinModule(): KotlinModule =
        KotlinModule
            .Builder()
            .configure(KotlinFeature.NullIsSameAsDefault, true)
            .build()
}
