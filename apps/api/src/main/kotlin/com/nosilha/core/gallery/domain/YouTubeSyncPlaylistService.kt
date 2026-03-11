package com.nosilha.core.gallery.domain

import com.nosilha.core.gallery.api.dto.SaveYouTubeSyncPlaylistRequest
import com.nosilha.core.gallery.repository.YouTubeSyncPlaylistRepository
import com.nosilha.core.shared.exception.BusinessException
import com.nosilha.core.shared.exception.ResourceNotFoundException
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * Manages saved YouTube playlists for one-click sync.
 */
@Service
@Transactional(readOnly = true)
class YouTubeSyncPlaylistService(
    private val repository: YouTubeSyncPlaylistRepository,
) {
    fun listPlaylists(): List<YouTubeSyncPlaylistEntity> = repository.findAllByOrderByLabelAsc()

    fun getPlaylist(id: UUID): YouTubeSyncPlaylistEntity =
        repository.findById(id).orElseThrow {
            ResourceNotFoundException("Saved playlist with ID '$id' not found.")
        }

    @Transactional
    fun savePlaylist(request: SaveYouTubeSyncPlaylistRequest): YouTubeSyncPlaylistEntity {
        if (repository.existsByPlaylistId(request.playlistId)) {
            throw BusinessException("A playlist with ID '${request.playlistId}' is already saved.")
        }
        val entity = YouTubeSyncPlaylistEntity(
            playlistId = request.playlistId,
            label = request.label,
            category = request.category,
        )
        logger.info { "Saving playlist: ${request.label} (${request.playlistId})" }
        return repository.save(entity)
    }

    @Transactional
    fun updatePlaylist(
        id: UUID,
        request: SaveYouTubeSyncPlaylistRequest,
    ): YouTubeSyncPlaylistEntity {
        val entity = getPlaylist(id)
        // Check uniqueness if playlist ID changed
        if (entity.playlistId != request.playlistId && repository.existsByPlaylistId(request.playlistId)) {
            throw BusinessException("A playlist with ID '${request.playlistId}' is already saved.")
        }
        entity.playlistId = request.playlistId
        entity.label = request.label
        entity.category = request.category
        return repository.save(entity)
    }

    @Transactional
    fun deletePlaylist(id: UUID) {
        val entity = getPlaylist(id)
        repository.delete(entity)
        logger.info { "Deleted saved playlist: ${entity.label} (${entity.playlistId})" }
    }

    @Transactional
    fun recordSyncResult(
        id: UUID,
        syncedCount: Int
    ) {
        val entity = getPlaylist(id)
        entity.lastSyncedAt = Instant.now()
        entity.lastSyncCount = syncedCount
        repository.save(entity)
    }
}
