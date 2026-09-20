package com.nosilha.core.gallery.api

import java.util.UUID

/**
 * A directory entry's hero image, as other modules read it (spec 034 FR-023, ADR-001).
 *
 * @property mediaId The `gallery_media` row serving as the hero
 * @property url Where the image is served from
 * @property photographerCredit The recorded credit; null when not recorded
 * @property archiveSource Where the image came from, such as a licence line; null when not recorded
 */
data class HeroMediaRef(
    val mediaId: UUID,
    val url: String,
    val photographerCredit: String?,
    val archiveSource: String?,
)
