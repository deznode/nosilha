package com.nosilha.core.shared.events

import java.time.Instant
import java.util.UUID

/**
 * Event published when a gallery image is promoted to hero image for a directory entry.
 *
 * <p>This event is triggered when an admin promotes an approved user-uploaded gallery image
 * to become the hero image for its associated directory entry. The Places module listens
 * to this event and updates the directory entry's imageUrl field.</p>
 *
 * <p><strong>Published by:</strong> {@code GalleryModerationService.promoteToHeroImage()} in the Gallery module</p>
 *
 * <p><strong>Consumed by:</strong></p>
 * <ul>
 *   <li>Places module - Updates directory entry's imageUrl to the promoted image</li>
 * </ul>
 *
 * <p><strong>Prerequisites for Publishing:</strong></p>
 * <ul>
 *   <li>Media must be a UserUploadedMedia (not ExternalMedia)</li>
 *   <li>Media must have ACTIVE status (approved)</li>
 *   <li>Media must have an entryId (linked to a directory entry)</li>
 *   <li>Media must have a publicUrl (accessible via CDN)</li>
 * </ul>
 *
 * @property entryId The unique identifier of the directory entry to update
 * @property imageUrl The public URL of the image to set as hero
 * @property mediaId The unique identifier of the promoted gallery media
 * @property promotedBy The admin user who performed the promotion
 * @property occurredAt Timestamp when the promotion occurred
 */
data class HeroImagePromotedEvent(
    val entryId: UUID,
    val imageUrl: String,
    val mediaId: UUID,
    val promotedBy: UUID,
    override val occurredAt: Instant = Instant.now(),
) : ApplicationModuleEvent
