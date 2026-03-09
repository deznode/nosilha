package com.nosilha.core.gallery.domain

/**
 * YouTube Data API v3 response models for internal deserialization.
 *
 * <p>These models mirror the YouTube API JSON structure and are used exclusively
 * by {@link YouTubeApiClient} and {@link YouTubeSyncService}. They are not
 * exposed in the public API.</p>
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
