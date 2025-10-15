package com.nosilha.core.directory.events

import com.nosilha.core.shared.events.ApplicationModuleEvent
import java.time.Instant
import java.util.UUID

/**
 * Event published when a new directory entry is created.
 *
 * <p>This event is triggered when a directory entry (Restaurant, Hotel, Landmark, or Beach)
 * is successfully created and persisted to the database. Other modules can listen to this
 * event to perform actions like creating placeholder media metadata, logging activity, or
 * updating search indexes.</p>
 *
 * <p><strong>Published by:</strong> {@code DirectoryEntryService.createEntry()} in the Directory module</p>
 *
 * <p><strong>Potential Consumers:</strong></p>
 * <ul>
 *   <li>Media module - Create placeholder metadata for the new entry</li>
 *   <li>Search module - Index the new entry for search functionality</li>
 *   <li>Analytics module - Track directory entry creation metrics</li>
 *   <li>Audit module - Log entry creation for compliance</li>
 * </ul>
 *
 * @property entryId The unique identifier of the created directory entry
 * @property category The category/type of the entry (Restaurant, Hotel, Landmark, Beach)
 * @property name The name of the created entry
 * @property occurredAt Timestamp when the entry was created
 */
data class DirectoryEntryCreatedEvent(
    val entryId: UUID,
    val category: String,
    val name: String,
    override val occurredAt: Instant = Instant.now()
) : ApplicationModuleEvent
