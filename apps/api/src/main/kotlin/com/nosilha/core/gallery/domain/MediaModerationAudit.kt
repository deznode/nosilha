package com.nosilha.core.gallery.domain

import com.nosilha.core.shared.domain.CreatableEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.util.UUID

/**
 * Entity representing an audit trail entry for gallery media moderation actions.
 *
 * <p>Records all moderation actions performed on media files for compliance,
 * tracking, and review purposes. Provides complete history of status changes,
 * reviewer actions, and reasons for moderation decisions.</p>
 *
 * <p>Extends CreatableEntity to inherit {@code createdAt} and {@code createdBy}
 * which map to the former {@code performed_at} and {@code performed_by} columns
 * (renamed in V16 migration).</p>
 *
 * @see com.nosilha.core.gallery.domain.GalleryMedia
 */
@Entity
@Table(name = "media_moderation_audit")
class MediaModerationAudit(
    /** UUID of the media file this audit entry relates to. */
    @Column(name = "media_id", nullable = false)
    val mediaId: UUID,
    /** Moderation action performed (APPROVE, FLAG, REJECT). */
    @Column(name = "action", nullable = false, length = 20)
    val action: String,
    /** Media status before the action was performed. */
    @Column(name = "previous_status", length = 20)
    val previousStatus: String? = null,
    /** Media status after the action was performed. */
    @Column(name = "new_status", length = 20)
    val newStatus: String? = null,
    /** Admin-provided reason for the action. */
    @Column(name = "reason", length = 1024)
    val reason: String? = null,
) : CreatableEntity() {
    /** Primary key (UUID, auto-generated). */
    @Id
    @GeneratedValue
    var id: UUID? = null
}
