package com.nosilha.core.gallery.domain

/**
 * Constants for YouTube channel sync.
 *
 * <p>Bean instantiation is gated on {@code youtube.sync.api-key} being present.
 * The enabled/disabled toggle is managed at runtime via {@code youtube_sync_config}
 * table and {@link YouTubeSyncConfigService}.</p>
 */
object YouTubeSyncConfig {
    const val PROPERTY_PREFIX = "youtube.sync"
    const val MAX_PAGES = 20
    const val MAX_RESULTS_PER_PAGE = 50
    const val YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3"
    const val PRIVACY_PUBLIC = "public"
}
