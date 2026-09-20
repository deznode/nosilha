package com.nosilha.core.gallery.domain

import java.math.BigDecimal

/**
 * An inclusive latitude/longitude box, bound as `BigDecimal` to match the
 * `DECIMAL(10,7)` coordinate columns of `gallery_media`.
 */
data class GeoBounds(
    val minLat: BigDecimal,
    val maxLat: BigDecimal,
    val minLng: BigDecimal,
    val maxLng: BigDecimal,
) {
    /** Same inclusive comparison the SQL `BETWEEN` makes. */
    fun contains(
        latitude: BigDecimal,
        longitude: BigDecimal,
    ): Boolean = latitude in minLat..maxLat && longitude in minLng..maxLng
}
