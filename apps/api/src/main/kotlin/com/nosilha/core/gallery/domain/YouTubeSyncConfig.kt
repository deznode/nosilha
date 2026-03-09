package com.nosilha.core.gallery.domain

/**
 * Configuration holder for YouTube channel sync settings.
 *
 * <p>All properties are injected via {@code @Value} annotations in consuming services.
 * The sync feature is gated behind {@code youtube.sync.enabled=true} using
 * {@code @ConditionalOnProperty}.</p>
 *
 * <p>Properties:</p>
 * <ul>
 *   <li>{@code youtube.sync.enabled} — Feature flag (default: false)</li>
 *   <li>{@code youtube.sync.api-key} — YouTube Data API v3 key</li>
 *   <li>{@code youtube.sync.channel-handle} — YouTube channel handle (default: nosilha)</li>
 *   <li>{@code youtube.sync.default-category} — Default gallery category for synced videos</li>
 * </ul>
 */
object YouTubeSyncConfig {
    const val PROPERTY_PREFIX = "youtube.sync"
    const val MAX_PAGES = 20
    const val MAX_RESULTS_PER_PAGE = 50
    const val YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3"
    const val PRIVACY_PUBLIC = "public"
}
