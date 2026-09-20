package com.nosilha.core.gallery.domain

import com.nosilha.core.gallery.api.GeoPoint
import com.nosilha.core.gallery.repository.GalleryArchiveQueries
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.util.UUID

/**
 * The one proximity rule: a photograph is near a point when it lies inside a box of
 * [RADIUS_DEGREES] around it (spec 034 FR-020).
 *
 * It serves both the `/photographs` region filter and the settlement unconfirmed
 * count, so the count a settlement names is the number of records its link lists.
 */
@Service
class PhotoProximityService(
    private val archiveQueries: GalleryArchiveQueries,
) {
    companion object {
        /** Half-width of the box in degrees, from the prototype (about 660 m north to south). */
        val RADIUS_DEGREES: BigDecimal = BigDecimal("0.006")

        /** Scale of the `gallery_media` coordinate columns, `DECIMAL(10,7)`. */
        private const val COORDINATE_SCALE = 7
    }

    fun boundsAround(
        latitude: Double,
        longitude: Double,
    ): GeoBounds {
        val lat = BigDecimal.valueOf(latitude).setScale(COORDINATE_SCALE, RoundingMode.HALF_UP)
        val lng = BigDecimal.valueOf(longitude).setScale(COORDINATE_SCALE, RoundingMode.HALF_UP)
        return GeoBounds(
            minLat = lat - RADIUS_DEGREES,
            maxLat = lat + RADIUS_DEGREES,
            minLng = lng - RADIUS_DEGREES,
            maxLng = lng + RADIUS_DEGREES,
        )
    }

    /**
     * Counts located archive records linked to no entry near each point, reading the
     * archive once however many points are asked about.
     */
    @Transactional(readOnly = true)
    fun countUnplacedNear(points: Map<UUID, GeoPoint>): Map<UUID, Int> {
        if (points.isEmpty()) return emptyMap()
        val located = archiveQueries.findLocatedUnplacedCoordinates()
        return points.mapValues { (_, point) ->
            val box = boundsAround(point.latitude, point.longitude)
            located.count { (lat, lng) -> box.contains(lat, lng) }
        }
    }
}
