package com.nosilha.core.gallery.domain

/**
 * Constraints on the public archive list (`GET /api/v1/gallery`). A null field adds no
 * constraint; every constraint is evaluated in SQL (spec 034 FR-018, FR-020).
 */
data class ArchiveFilter(
    val category: String? = null,
    val decade: IntRange? = null,
    val query: String? = null,
    /** `true`: uploads with coordinates. `false` or null: no constraint (legacy). */
    val hasGeo: Boolean? = null,
    /** `true`: records with coordinates. `false`: uploads without. */
    val hasPlace: Boolean? = null,
    /** `false`: no date taken and no approximate date. `true`: either is recorded. */
    val hasDate: Boolean? = null,
    /** `IMAGE`: photographs (uploads). `VIDEO`: films (external videos). */
    val mediaType: MediaType? = null,
    val near: GeoBounds? = null,
    /** `true`: records linked to no directory entry. */
    val unplaced: Boolean? = null,
)
