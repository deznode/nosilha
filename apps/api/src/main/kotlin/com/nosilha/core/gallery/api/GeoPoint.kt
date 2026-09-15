package com.nosilha.core.gallery.api

/**
 * A coordinate another module asks the gallery about (spec 034 FR-020).
 *
 * Gallery takes coordinates, never a settlement, so it never depends on places.
 */
data class GeoPoint(
    val latitude: Double,
    val longitude: Double,
)
