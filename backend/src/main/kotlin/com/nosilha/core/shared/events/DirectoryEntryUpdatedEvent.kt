package com.nosilha.core.shared.events

import java.time.Instant
import java.util.UUID

/**
 * Event published when an existing directory entry is updated.
 *
 * <p>This event is triggered when a directory entry is successfully updated in the database.
 * Other modules can listen to this event to perform actions like invalidating caches, updating
 * search indexes, or logging modification activity.</p>
 *
 * <p><strong>Published by:</strong> {@code DirectoryEntryService.updateEntry()} in the Directory module</p>
 *
 * <p><strong>Potential Consumers:</strong></p>
 * <ul>
 *   <li>Cache module - Invalidate cached directory entry data</li>
 *   <li>Search module - Re-index the updated entry</li>
 *   <li>Analytics module - Track entry modification metrics</li>
 *   <li>Audit module - Log entry updates for compliance</li>
 * </ul>
 *
 * @property entryId The unique identifier of the updated directory entry
 * @property category The category/type of the entry
 * @property occurredAt Timestamp when the entry was updated
 */
data class DirectoryEntryUpdatedEvent(
    val entryId: UUID,
    val category: String,
    override val occurredAt: Instant = Instant.now(),
) : ApplicationModuleEvent
