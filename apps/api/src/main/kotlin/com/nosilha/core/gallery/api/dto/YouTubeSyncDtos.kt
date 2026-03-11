package com.nosilha.core.gallery.api.dto

import com.nosilha.core.gallery.domain.YouTubeSyncConfigEntity
import com.nosilha.core.gallery.domain.YouTubeSyncPlaylistEntity
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant

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
) {
    val totalProcessed: Int get() = synced + skipped + errors.size
}

/**
 * Response DTO for YouTube sync runtime configuration.
 */
data class YouTubeSyncConfigDto(
    val enabled: Boolean,
    val defaultCategory: String?,
    val apiKeyConfigured: Boolean,
    val updatedAt: Instant?,
    val videoCount: Long,
) {
    companion object {
        fun from(
            entity: YouTubeSyncConfigEntity,
            apiKeyConfigured: Boolean,
            videoCount: Long,
        ) = YouTubeSyncConfigDto(
            enabled = entity.enabled,
            defaultCategory = entity.defaultCategory,
            apiKeyConfigured = apiKeyConfigured,
            updatedAt = entity.updatedAt,
            videoCount = videoCount,
        )

        fun disabled() =
            YouTubeSyncConfigDto(
                enabled = false,
                defaultCategory = null,
                apiKeyConfigured = false,
                updatedAt = null,
                videoCount = 0,
            )
    }
}

/**
 * Request DTO for updating YouTube sync configuration.
 */
data class UpdateYouTubeSyncConfigRequest(
    val enabled: Boolean,
    val defaultCategory: String? = null,
)

/**
 * Response DTO for a saved YouTube sync playlist.
 */
data class YouTubeSyncPlaylistDto(
    val id: String,
    val playlistId: String,
    val label: String,
    val category: String?,
    val lastSyncedAt: Instant?,
    val lastSyncCount: Int,
    val createdAt: Instant,
)

fun YouTubeSyncPlaylistEntity.toDto() =
    YouTubeSyncPlaylistDto(
        id = id.toString(),
        playlistId = playlistId,
        label = label,
        category = category,
        lastSyncedAt = lastSyncedAt,
        lastSyncCount = lastSyncCount,
        createdAt = createdAt,
    )

/**
 * Request DTO for creating or updating a saved YouTube playlist.
 */
data class SaveYouTubeSyncPlaylistRequest(
    @field:NotBlank
    val playlistId: String = "",
    @field:NotBlank
    @field:Size(max = 200)
    val label: String = "",
    val category: String? = null,
)
