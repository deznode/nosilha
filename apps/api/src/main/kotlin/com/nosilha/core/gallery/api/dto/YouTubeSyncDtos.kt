package com.nosilha.core.gallery.api.dto

/**
 * Request DTO for triggering a YouTube channel/playlist sync.
 *
 * <p>When no playlistId is provided, syncs the full channel's uploads playlist.
 * When playlistId is provided, syncs that specific playlist with an optional
 * category override.</p>
 */
data class YouTubeSyncRequest(
    val playlistId: String? = null,
    val category: String? = null,
)

/**
 * Response DTO summarizing the results of a YouTube sync operation.
 */
data class YouTubeSyncResult(
    val synced: Int,
    val skipped: Int,
    val errors: List<String>,
    val totalProcessed: Int,
)

// --- YouTube Data API v3 response models (internal, not exposed in API) ---

/**
 * Top-level response from YouTube playlistItems.list endpoint.
 */
data class YouTubePlaylistResponse(
    val items: List<YouTubePlaylistItem>? = null,
    val nextPageToken: String? = null,
)

data class YouTubePlaylistItem(
    val snippet: YouTubeSnippet? = null,
    val contentDetails: YouTubePlaylistItemContentDetails? = null,
    val status: YouTubePlaylistItemStatus? = null,
)

data class YouTubeSnippet(
    val title: String? = null,
    val description: String? = null,
    val channelTitle: String? = null,
    val thumbnails: YouTubeThumbnails? = null,
    val resourceId: YouTubeResourceId? = null,
)

data class YouTubeResourceId(
    val videoId: String? = null,
)

data class YouTubeThumbnails(
    val maxres: YouTubeThumbnail? = null,
    val standard: YouTubeThumbnail? = null,
    val high: YouTubeThumbnail? = null,
    val medium: YouTubeThumbnail? = null,
    val default: YouTubeThumbnail? = null,
)

data class YouTubeThumbnail(
    val url: String? = null,
)

data class YouTubePlaylistItemContentDetails(
    val videoId: String? = null,
    val videoPublishedAt: String? = null,
)

data class YouTubePlaylistItemStatus(
    val privacyStatus: String? = null,
)

/**
 * Top-level response from YouTube channels.list endpoint.
 */
data class YouTubeChannelResponse(
    val items: List<YouTubeChannelItem>? = null,
)

data class YouTubeChannelItem(
    val id: String? = null,
    val contentDetails: YouTubeChannelContentDetails? = null,
)

data class YouTubeChannelContentDetails(
    val relatedPlaylists: YouTubeRelatedPlaylists? = null,
)

data class YouTubeRelatedPlaylists(
    val uploads: String? = null,
)
