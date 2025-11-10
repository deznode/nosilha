package com.nosilha.core.shared.events

import java.time.Instant
import java.util.UUID

/**
 * Event published when a directory entry is deleted.
 *
 * <p>This event is triggered when a directory entry is successfully deleted from the database.
 * Other modules can listen to this event to perform cleanup actions like removing associated
 * media metadata, invalidating caches, or logging deletion activity.</p>
 *
 * <p><strong>Published by:</strong> {@code DirectoryEntryService.deleteEntry()} in the Directory module</p>
 *
 * <p><strong>Potential Consumers:</strong></p>
 * <ul>
 *   <li>Media module - Delete associated media metadata and files</li>
 *   <li>Cache module - Invalidate cached directory entry data</li>
 *   <li>Search module - Remove entry from search index</li>
 *   <li>Analytics module - Track entry deletion metrics</li>
 *   <li>Audit module - Log entry deletion for compliance</li>
 * </ul>
 *
 * @property entryId The unique identifier of the deleted directory entry
 * @property occurredAt Timestamp when the entry was deleted
 */
data class DirectoryEntryDeletedEvent(
    val entryId: UUID,
    override val occurredAt: Instant = Instant.now(),
) : ApplicationModuleEvent
