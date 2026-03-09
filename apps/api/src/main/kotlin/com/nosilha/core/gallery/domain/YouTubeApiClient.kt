package com.nosilha.core.gallery.domain

import com.nosilha.core.gallery.api.dto.YouTubeChannelResponse
import com.nosilha.core.gallery.api.dto.YouTubePlaylistResponse
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient
import org.springframework.web.client.RestClientException

private val logger = KotlinLogging.logger {}

/**
 * HTTP client for YouTube Data API v3.
 *
 * <p>Provides methods to resolve a channel handle to its uploads playlist ID
 * and to fetch playlist items with pagination. Uses Spring {@code RestClient}
 * for idiomatic Spring Boot 4 HTTP calls with built-in Jackson deserialization.</p>
 *
 * <p>Activated only when {@code youtube.sync.enabled=true}.</p>
 *
 * <p>API quota costs:</p>
 * <ul>
 *   <li>{@code channels.list} — 1 unit per call</li>
 *   <li>{@code playlistItems.list} — 1 unit per page of 50 items</li>
 * </ul>
 */
@Service
@ConditionalOnProperty(
    prefix = YouTubeSyncConfig.PROPERTY_PREFIX,
    name = ["enabled"],
    havingValue = "true",
)
class YouTubeApiClient(
    @Value("\${youtube.sync.api-key}")
    private val apiKey: String,
    restClientBuilder: RestClient.Builder,
) {
    private val restClient: RestClient = restClientBuilder
        .baseUrl(YouTubeSyncConfig.YOUTUBE_API_BASE_URL)
        .build()

    @Volatile
    private var cachedUploadsPlaylistId: String? = null

    /**
     * Resolves a YouTube channel handle to its uploads playlist ID.
     *
     * <p>The result is cached in memory after the first successful resolution
     * since a channel's uploads playlist ID never changes.</p>
     *
     * @param channelHandle The channel handle (e.g., "nosilha" or "@nosilha")
     * @return The uploads playlist ID (e.g., "UU...")
     * @throws YouTubeApiException if the channel cannot be resolved
     */
    fun fetchUploadsPlaylistId(channelHandle: String): String {
        cachedUploadsPlaylistId?.let { return it }

        val handle = channelHandle.removePrefix("@")
        logger.info { "Resolving YouTube channel handle: @$handle" }

        try {
            val response = restClient
                .get()
                .uri { uriBuilder ->
                    uriBuilder
                        .path("/channels")
                        .queryParam("part", "contentDetails")
                        .queryParam("forHandle", handle)
                        .queryParam("key", apiKey)
                        .build()
                }.retrieve()
                .body(YouTubeChannelResponse::class.java)

            val uploadsPlaylistId = response
                ?.items
                ?.firstOrNull()
                ?.contentDetails
                ?.relatedPlaylists
                ?.uploads
                ?: throw YouTubeApiException("Channel @$handle not found or has no uploads playlist")

            cachedUploadsPlaylistId = uploadsPlaylistId
            logger.info { "Resolved @$handle uploads playlist: $uploadsPlaylistId" }
            return uploadsPlaylistId
        } catch (e: RestClientException) {
            throw YouTubeApiException("Failed to resolve channel @$handle: ${e.message}", e)
        }
    }

    /**
     * Fetches a single page of playlist items from YouTube Data API v3.
     *
     * <p>Requests {@code snippet}, {@code contentDetails}, and {@code status} parts
     * for full video metadata including privacy status and true publish date.</p>
     *
     * @param playlistId The YouTube playlist ID
     * @param pageToken Optional page token for pagination (null for first page)
     * @return Response containing playlist items and optional next page token
     * @throws YouTubeApiException if the API call fails
     */
    fun fetchPlaylistItems(
        playlistId: String,
        pageToken: String? = null
    ): YouTubePlaylistResponse {
        try {
            val response = restClient
                .get()
                .uri { uriBuilder ->
                    val builder = uriBuilder
                        .path("/playlistItems")
                        .queryParam("part", "snippet,contentDetails,status")
                        .queryParam("playlistId", playlistId)
                        .queryParam("maxResults", YouTubeSyncConfig.MAX_RESULTS_PER_PAGE)
                        .queryParam("key", apiKey)
                    if (pageToken != null) {
                        builder.queryParam("pageToken", pageToken)
                    }
                    builder.build()
                }.retrieve()
                .body(YouTubePlaylistResponse::class.java)

            return response ?: YouTubePlaylistResponse()
        } catch (e: RestClientException) {
            throw YouTubeApiException("Failed to fetch playlist items for $playlistId: ${e.message}", e)
        }
    }
}

/**
 * Exception for YouTube Data API errors.
 */
class YouTubeApiException(
    message: String,
    cause: Throwable? = null
) : RuntimeException(message, cause)
