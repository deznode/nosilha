package com.nosilha.core.config

import com.github.benmanes.caffeine.cache.Caffeine
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.EnableCaching
import org.springframework.cache.caffeine.CaffeineCacheManager
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.Duration

/**
 * Central cache configuration for the application.
 *
 * Currently provisions the `reactionCounts` cache with a 5-minute TTL to meet
 * FR-015 performance requirements for the content action section.
 */
@Configuration
@EnableCaching
class CacheConfig {
    companion object {
        private const val REACTION_COUNTS_CACHE = "reactionCounts"
        private val REACTION_CACHE_TTL: Duration = Duration.ofMinutes(5)
    }

    @Bean
    fun cacheManager(): CacheManager {
        val manager = CaffeineCacheManager(REACTION_COUNTS_CACHE)
        manager.setCaffeine(
            Caffeine
                .newBuilder()
                .expireAfterWrite(REACTION_CACHE_TTL),
        )
        return manager
    }
}
