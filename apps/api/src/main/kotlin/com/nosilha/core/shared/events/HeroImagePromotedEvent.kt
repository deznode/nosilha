package com.nosilha.core.shared.events

import java.time.Instant
import java.util.UUID

/**
 * Event published when an admin promotes a gallery image to be a directory entry's hero.
 *
 * <p>The hero lives in the gallery module as the entry's `gallery_media` row with role HERO
 * (spec 034 FR-023, ADR-001), so promotion changes no places data. Places listens only to
 * refresh the entry's cached pages.</p>
 *
 * <p><strong>Published by:</strong> {@code HeroMediaService.promote()} in the Gallery module</p>
 *
 * <p><strong>Consumed by:</strong></p>
 * <ul>
 *   <li>Places module - Revalidates the entry's frontend pages</li>
 * </ul>
 *
 * @property entryId The directory entry whose hero changed
 * @property mediaId The gallery media now serving as its hero
 * @property promotedBy The admin user who performed the promotion
 * @property occurredAt Timestamp when the promotion occurred
 */
data class HeroImagePromotedEvent(
    val entryId: UUID,
    val mediaId: UUID,
    val promotedBy: UUID,
    override val occurredAt: Instant = Instant.now(),
) : ApplicationModuleEvent
