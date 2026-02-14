package com.nosilha.core.shared.config

import org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import tools.jackson.databind.cfg.DateTimeFeature
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
 * Configures Instant/date-time serialization to use ISO-8601 strings instead of numeric
 * timestamps, ensuring consistent API responses across all endpoints.
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

    @Bean
    fun jsonMapperDateTimeCustomizer(): JsonMapperBuilderCustomizer =
        JsonMapperBuilderCustomizer { builder ->
            builder.disable(DateTimeFeature.WRITE_DATES_AS_TIMESTAMPS)
        }
}
