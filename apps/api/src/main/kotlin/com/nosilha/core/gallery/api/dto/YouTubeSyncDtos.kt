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
) {
    val totalProcessed: Int get() = synced + skipped + errors.size
}
