package com.nosilha.core.media.domain

import com.nosilha.core.directory.events.DirectoryEntryCreatedEvent
import org.slf4j.LoggerFactory
import org.springframework.modulith.ApplicationModuleListener
import org.springframework.stereotype.Service

/**
 * Media Service
 *
 * <p>Handles media asset management, storage, and AI processing orchestration.
 * This service listens to directory entry creation events and automatically
 * creates placeholder media metadata for new entries.
 *
 * <p><strong>Event-Driven Communication:</strong>
 * <ul>
 *   <li>Listens to DirectoryEntryCreatedEvent from directory module</li>
 *   <li>Creates placeholder media metadata on entry creation</li>
 *   <li>Publishes MediaUploadedEvent when media is uploaded</li>
 *   <li>Publishes MediaProcessedEvent after AI processing completes</li>
 * </ul>
 *
 * <p><strong>Future Enhancements:</strong>
 * <ul>
 *   <li>Google Cloud Storage integration for media uploads</li>
 *   <li>Cloud Vision API integration for image analysis</li>
 *   <li>Firestore integration for metadata storage</li>
 * </ul>
 */
@Service
internal class MediaService {

    private val logger = LoggerFactory.getLogger(MediaService::class.java)

    /**
     * Listens to DirectoryEntryCreatedEvent and creates placeholder media metadata.
     *
     * <p>This demonstrates cross-module event-driven communication without direct
     * coupling between the directory and media modules.
     *
     * @param event The directory entry created event
     */
    @ApplicationModuleListener
    fun onDirectoryEntryCreated(event: DirectoryEntryCreatedEvent) {
        logger.info(
            "Received DirectoryEntryCreatedEvent for entry: {} (category: {}, name: {})",
            event.entryId,
            event.category,
            event.name
        )

        // TODO: Create placeholder media metadata in Firestore
        // For now, just log the event to demonstrate listener pattern
        logger.debug("Creating placeholder media metadata for directory entry: {}", event.entryId)
    }
}
