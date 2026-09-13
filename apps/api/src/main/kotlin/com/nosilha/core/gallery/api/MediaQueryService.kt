package com.nosilha.core.gallery.api

import com.nosilha.core.gallery.domain.GalleryMediaStatus
import java.util.UUID

/**
 * Query service interface for cross-module media statistics.
 * Used by feedback module's DashboardService for admin dashboard.
 */
interface MediaQueryService {
    fun countByStatus(status: GalleryMediaStatus): Long

    /**
     * Returns which of the given directory entries have at least one publicly visible
     * photograph.
     *
     * <p>"Has a photograph" is the gallery module's concept to define — it means media
     * in [GalleryMediaStatus.ACTIVE], not merely uploaded or awaiting review. Places
     * asks this question across the module boundary rather than reimplementing the
     * rule against gallery's tables (spec 033 FR-005).</p>
     *
     * @param entryIds directory entry ids to test
     * @return the subset of [entryIds] having at least one ACTIVE media record
     */
    fun findEntryIdsWithActiveMedia(entryIds: Collection<UUID>): Set<UUID>
}
