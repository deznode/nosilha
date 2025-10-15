/**
 * Media Module
 *
 * <p>This module is responsible for managing media assets (images, videos, documents)
 * and AI-processed metadata for the Nos Ilha cultural heritage platform.
 *
 * <p><strong>Responsibilities:</strong>
 * <ul>
 *   <li>Media asset storage and retrieval via Google Cloud Storage</li>
 *   <li>AI processing orchestration with Cloud Vision API</li>
 *   <li>Media metadata management in Firestore</li>
 *   <li>Event-driven media processing triggered by directory entry creation</li>
 * </ul>
 *
 * <p><strong>Module Boundaries:</strong>
 * <ul>
 *   <li>Depends on: shared :: api, shared :: events</li>
 *   <li>Exposes: MediaController (REST API), MediaEvents (for other modules)</li>
 *   <li>Internal: MediaService, repositories (package-private)</li>
 * </ul>
 *
 * <p><strong>Event Communication:</strong>
 * <ul>
 *   <li>Listens to: DirectoryEntryCreatedEvent (from directory module)</li>
 *   <li>Publishes: MediaUploadedEvent, MediaProcessedEvent</li>
 * </ul>
 *
 * @since 1.0
 */
@org.springframework.modulith.ApplicationModule(
    displayName = "Media Module",
    allowedDependencies = {"shared :: api", "shared :: events"}
)
package com.nosilha.core.media;
