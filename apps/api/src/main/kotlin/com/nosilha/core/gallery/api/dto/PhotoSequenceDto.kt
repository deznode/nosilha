package com.nosilha.core.gallery.api.dto

import java.util.UUID

/**
 * Where a photograph sits among located archive photographs (spec 034 FR-021).
 *
 * @property id The requested record
 * @property position 1-based position, or null when the record has no coordinates
 * @property total Located archive records
 * @property previousId Previous record, wrapping from the first to the last; null when unlocated
 * @property nextId Next record, wrapping from the last to the first; null when unlocated
 */
data class PhotoSequenceDto(
    val id: UUID,
    val position: Int?,
    val total: Int,
    val previousId: UUID?,
    val nextId: UUID?,
)
