package com.nosilha.core.gallery.events

import com.nosilha.core.shared.events.ApplicationModuleEvent
import java.time.Instant
import java.util.UUID

/**
 * Event published when media is uploaded.
 *
 * <p>This event notifies other modules that new media has been uploaded
 * and is available for processing or display.</p>
 *
 * @property mediaId Unique identifier for the media asset
 * @property entryId Directory entry ID this media is associated with
 * @property mediaUrl URL for accessing the uploaded media
 * @property occurredAt Timestamp when the media was uploaded
 */
data class MediaUploadedEvent(
    val mediaId: UUID,
    val entryId: UUID,
    val mediaUrl: String,
    override val occurredAt: Instant = Instant.now(),
) : ApplicationModuleEvent
