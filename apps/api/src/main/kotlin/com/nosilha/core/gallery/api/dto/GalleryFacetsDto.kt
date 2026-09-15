package com.nosilha.core.gallery.api.dto

/**
 * Whole-archive counts for chips, standfirsts and home copy (spec 034 FR-018).
 *
 * Counted over the same records `GET /api/v1/gallery` lists, so `total` equals the
 * unfiltered list's `totalElements`.
 *
 * @property total Archive records
 * @property photographs Uploads
 * @property films External videos
 * @property withPlace Records with coordinates
 * @property withoutPlace Uploads without coordinates
 * @property withoutDate Records with no date taken and no approximate date
 * @property uncredited Records with no credit, or the credit "not known"
 */
data class GalleryFacetsDto(
    val total: Long,
    val photographs: Long,
    val films: Long,
    val withPlace: Long,
    val withoutPlace: Long,
    val withoutDate: Long,
    val uncredited: Long,
)
