package com.nosilha.core.gallery.domain

import com.nosilha.core.shared.domain.AuditableEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

/**
 * A saved YouTube playlist that can be synced with one click.
 *
 * <p>Each record maps a YouTube playlist ID to a human-readable label and
 * optional category override. Tracks last sync time and count for display
 * in the admin UI.</p>
 */
@Entity
@Table(name = "youtube_sync_playlist")
class YouTubeSyncPlaylistEntity(
    @Column(name = "playlist_id", nullable = false, length = 100)
    var playlistId: String = "",
    @Column(name = "label", nullable = false, length = 200)
    var label: String = "",
    @Column(name = "category", length = 100)
    var category: String? = null,
    @Column(name = "last_synced_at")
    var lastSyncedAt: Instant? = null,
    @Column(name = "last_sync_count")
    var lastSyncCount: Int = 0,
) : AuditableEntity() {
    @Id
    @GeneratedValue
    var id: UUID? = null
}
