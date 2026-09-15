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
     * Counts the publicly visible photographs attached to each of the given entries.
     *
     * <p>"A photograph" is the gallery module's concept to define — it means an archive
     * record in [GalleryMediaStatus.ACTIVE], not merely uploaded or awaiting review, and
     * not an entry's hero, which heads its record rather than being a photograph of the
     * place (spec 034, decided 2026-09-15). Places asks across the module boundary rather
     * than reimplementing the rule against gallery's tables (spec 033 FR-005). One query
     * answers the whole set (spec 034 FR-017).</p>
     *
     * @param entryIds directory entry ids to count
     * @return entry id to count, omitting entries with none
     */
    fun countActiveMediaByEntryIds(entryIds: Collection<UUID>): Map<UUID, Long>

    /**
     * Counts unconfirmed photographs near each point: located archive records linked to
     * no entry, inside the proximity rule `GET /api/v1/gallery?nearLat&nearLng&unplaced=true`
     * lists by (spec 034 FR-020). One call answers every point.
     *
     * @param points caller's key to coordinate
     * @return the same keys, each with its count (zero included)
     */
    fun countUnplacedNear(points: Map<UUID, GeoPoint>): Map<UUID, Int>
}
