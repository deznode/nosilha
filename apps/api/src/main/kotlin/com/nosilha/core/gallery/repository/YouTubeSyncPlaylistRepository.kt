package com.nosilha.core.gallery.repository

import com.nosilha.core.gallery.domain.YouTubeSyncPlaylistEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface YouTubeSyncPlaylistRepository : JpaRepository<YouTubeSyncPlaylistEntity, UUID> {
    fun findByPlaylistId(playlistId: String): YouTubeSyncPlaylistEntity?

    fun existsByPlaylistId(playlistId: String): Boolean

    fun findAllByOrderByLabelAsc(): List<YouTubeSyncPlaylistEntity>
}
