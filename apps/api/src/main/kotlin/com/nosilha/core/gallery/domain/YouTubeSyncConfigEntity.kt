package com.nosilha.core.gallery.domain

import com.nosilha.core.shared.domain.AuditableEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.util.UUID

/**
 * Runtime configuration for YouTube channel sync.
 *
 * <p>Single-row table storing the enabled toggle and default category.
 * Admins can modify these at runtime via the YouTube Sync admin page
 * without restarting the server.</p>
 */
@Entity
@Table(name = "youtube_sync_config")
class YouTubeSyncConfigEntity(
    @Column(name = "enabled", nullable = false)
    var enabled: Boolean = false,
    @Column(name = "default_category", length = 100)
    var defaultCategory: String? = null,
) : AuditableEntity() {
    @Id
    @GeneratedValue
    var id: UUID? = null
}
