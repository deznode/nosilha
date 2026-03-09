package com.nosilha.core.gallery.domain

import com.nosilha.core.gallery.api.dto.CreateExternalMediaRequest
import com.nosilha.core.gallery.api.dto.YouTubeSyncResult
import com.nosilha.core.gallery.repository.GalleryMediaRepository
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * Orchestrates YouTube channel/playlist sync operations.
 *
 * <p>Fetches videos from YouTube via {@link YouTubeApiClient}, deduplicates
 * against existing {@link ExternalMedia} records, and creates new records
 * using {@link GalleryModerationService#createExternalMedia}.</p>
 *
 * <p>Key behaviors:</p>
 * <ul>
 *   <li>Paginates through all playlist pages (max {@value YouTubeSyncConfig#MAX_PAGES} pages)</li>
 *   <li>Skips videos that already exist (dedup by platform + externalId)</li>
 *   <li>Filters out non-public videos (private, unlisted)</li>
 *   <li>Catches per-video errors without aborting the batch</li>
 *   <li>New records created with ACTIVE status (auto-approved)</li>
 * </ul>
 */
@Service
class YouTubeSyncService(
    private val youTubeApiClient: YouTubeApiClient,
    private val moderationService: GalleryModerationService,
    private val repository: GalleryMediaRepository,
    private val configService: YouTubeSyncConfigService,
    @Value("\${youtube.sync.channel-handle:nosilha}")
    private val channelHandle: String,
) {
    /**
     * Syncs all public videos from the configured YouTube channel.
     *
     * <p>Resolves the channel handle to its uploads playlist ID, then
     * delegates to {@link #syncPlaylist}.</p>
     *
     * @param adminId UUID of the admin triggering the sync
     * @return Summary of sync results
     */
    fun syncChannel(adminId: UUID): YouTubeSyncResult {
        logger.info { "Starting YouTube channel sync for @$channelHandle (admin: $adminId)" }
        val uploadsPlaylistId = youTubeApiClient.fetchUploadsPlaylistId(channelHandle)
        val category = configService.getConfig().defaultCategory
        return syncPlaylist(uploadsPlaylistId, category, adminId)
    }

    /**
     * Syncs videos from a specific YouTube playlist.
     *
     * @param playlistId The YouTube playlist ID
     * @param category Optional gallery category for synced videos
     * @param adminId UUID of the admin triggering the sync
     * @return Summary of sync results
     */
    fun syncPlaylist(
        playlistId: String,
        category: String?,
        adminId: UUID
    ): YouTubeSyncResult {
        logger.info { "Syncing YouTube playlist: $playlistId (category: ${category ?: "default"})" }

        var synced = 0
        var skipped = 0
        val errors = mutableListOf<String>()
        var pageToken: String? = null
        var pageCount = 0

        do {
            val response = youTubeApiClient.fetchPlaylistItems(playlistId, pageToken)
            val items = response.items ?: emptyList()

            // Batch-fetch existing external IDs for this page (1 query per page instead of per-video)
            val videoIds = items.mapNotNull { it.extractVideoId() }
            val existingIds = if (videoIds.isNotEmpty()) {
                repository.findExternalIdsByPlatformAndExternalIds(ExternalPlatform.YOUTUBE, videoIds)
            } else {
                emptySet()
            }

            for (item in items) {
                val videoId = item.extractVideoId()
                if (videoId == null) {
                    logger.debug { "Skipping playlist item with no video ID" }
                    continue
                }

                // Skip non-public videos
                val privacyStatus = item.status?.privacyStatus
                if (privacyStatus != YouTubeSyncConfig.PRIVACY_PUBLIC) {
                    logger.debug { "Skipping non-public video $videoId (status: $privacyStatus)" }
                    skipped++
                    continue
                }

                // Dedup check (batch pre-fetched)
                if (videoId in existingIds) {
                    skipped++
                    continue
                }

                // Create new ExternalMedia
                try {
                    val request = mapToCreateRequest(item, videoId, category)
                    moderationService.createExternalMedia(request, adminId)
                    synced++
                    logger.debug { "Synced video: $videoId - ${request.title}" }
                } catch (e: Exception) {
                    val errorMsg = "Failed to sync video $videoId: ${e.message}"
                    logger.warn(e) { errorMsg }
                    errors.add(errorMsg)
                }
            }

            pageToken = response.nextPageToken
            pageCount++
        } while (pageToken != null && pageCount < YouTubeSyncConfig.MAX_PAGES)

        val result = YouTubeSyncResult(
            synced = synced,
            skipped = skipped,
            errors = errors,
        )
        logger.info {
            "YouTube sync complete: synced=$synced, skipped=$skipped, errors=${errors.size}, " +
                "totalProcessed=${result.totalProcessed}, pages=$pageCount"
        }

        return result
    }

    private fun mapToCreateRequest(
        item: YouTubePlaylistItem,
        videoId: String,
        category: String?,
    ): CreateExternalMediaRequest {
        val snippet = item.snippet
        val description = snippet?.description?.take(2048)

        return CreateExternalMediaRequest(
            mediaType = MediaType.VIDEO,
            platform = ExternalPlatform.YOUTUBE,
            externalId = videoId,
            title = snippet?.title ?: "Untitled Video",
            description = description,
            author = snippet?.channelTitle,
            thumbnailUrl = resolveThumbnailUrl(snippet?.thumbnails),
            category = category,
        )
    }

    private fun resolveThumbnailUrl(thumbnails: YouTubeThumbnails?): String? {
        if (thumbnails == null) return null
        return thumbnails.maxres?.url
            ?: thumbnails.standard?.url
            ?: thumbnails.high?.url
            ?: thumbnails.medium?.url
            ?: thumbnails.default?.url
    }
}
