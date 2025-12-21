package com.nosilha.core.media.domain

import com.nosilha.core.shared.events.DirectoryEntryCreatedEvent
import org.slf4j.LoggerFactory
import org.springframework.modulith.ApplicationModuleListener
import org.springframework.stereotype.Service

/**
 * Media Service
 *
 * <p>Handles media asset management and storage orchestration.
 * This service listens to directory entry creation events for potential
 * automatic media association.</p>
 *
 * <p><strong>Event-Driven Communication:</strong></p>
 * <ul>
 *   <li>Listens to DirectoryEntryCreatedEvent from directory module</li>
 *   <li>Publishes MediaUploadedEvent when media is uploaded</li>
 * </ul>
 *
 * <p><strong>Storage:</strong></p>
 * <ul>
 *   <li>Media files stored on local filesystem (development)</li>
 *   <li>Metadata persisted in PostgreSQL via MediaRepository</li>
 *   <li>Cloud storage integration deferred for production</li>
 * </ul>
 *
 * <p><strong>Future Enhancements:</strong></p>
 * <ul>
 *   <li>Cloud storage integration for production (GCS or Supabase Storage)</li>
 *   <li>AI integration for automatic image tagging and alt text generation</li>
 * </ul>
 */
@Service
internal class MediaService {
    private val logger = LoggerFactory.getLogger(MediaService::class.java)

    /**
     * Listens to DirectoryEntryCreatedEvent for cross-module awareness.
     *
     * <p>This demonstrates event-driven communication between the directory
     * and media modules without direct coupling. Media can be associated
     * with directory entries via the entry_id foreign key.</p>
     *
     * @param event The directory entry created event
     */
    @ApplicationModuleListener
    fun onDirectoryEntryCreated(event: DirectoryEntryCreatedEvent) {
        logger.info(
            "Received DirectoryEntryCreatedEvent for entry: {} (category: {}, name: {})",
            event.entryId,
            event.category,
            event.name,
        )

        // Media can be associated with this entry via the entry_id field
        // when uploaded through the FileUploadController
        logger.debug("Directory entry created - media can be associated via entry_id: {}", event.entryId)
    }
}
