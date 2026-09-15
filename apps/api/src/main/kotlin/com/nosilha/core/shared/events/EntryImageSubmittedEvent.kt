package com.nosilha.core.shared.events

import java.time.Instant
import java.util.UUID

/**
 * Event published when a directory entry write carries an image URL, or clears it.
 *
 * <p>Places no longer stores an entry's image. The gallery module owns heroes as
 * `gallery_media` rows with role HERO (spec 034 FR-023, ADR-001) and handles this event by
 * making [imageUrl] the entry's hero, or by removing the hero when [imageUrl] is null.</p>
 *
 * <p><strong>Published by:</strong> {@code DirectoryEntryService} on create, update and public
 * submission, in the Places module</p>
 *
 * <p><strong>Consumed by:</strong></p>
 * <ul>
 *   <li>Gallery module - {@code HeroMediaService} sets or removes the entry's hero</li>
 * </ul>
 *
 * @property entryId The directory entry the image heads
 * @property imageUrl The submitted image URL, or null when an update cleared it
 * @property entryPublished Whether the entry is published; an unpublished entry's image waits for review
 * @property occurredAt Timestamp when the write happened
 */
data class EntryImageSubmittedEvent(
    val entryId: UUID,
    val imageUrl: String?,
    val entryPublished: Boolean,
    override val occurredAt: Instant = Instant.now(),
) : ApplicationModuleEvent
