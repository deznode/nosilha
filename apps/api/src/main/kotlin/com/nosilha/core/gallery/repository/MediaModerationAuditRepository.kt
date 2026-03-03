package com.nosilha.core.gallery.repository

import com.nosilha.core.gallery.domain.MediaModerationAudit
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

/**
 * Spring Data JPA repository for managing MediaModerationAudit entities.
 *
 * <p>Provides standard CRUD operations plus custom query methods for
 * finding audit entries by media ID to track moderation history.</p>
 */
@Repository
interface MediaModerationAuditRepository : JpaRepository<MediaModerationAudit, UUID> {
    /**
     * Finds all audit entries for a specific media file, ordered by timestamp descending.
     *
     * <p>Returns the complete moderation history for a media file, with the most
     * recent actions first. Useful for displaying audit trail in admin panel.</p>
     *
     * @param mediaId The UUID of the media file
     * @return List of audit entries sorted by performedAt descending
     */
    fun findByMediaIdOrderByPerformedAtDesc(mediaId: UUID): List<MediaModerationAudit>
}
