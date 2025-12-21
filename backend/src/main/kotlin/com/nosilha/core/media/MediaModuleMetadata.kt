package com.nosilha.core.media

import org.springframework.modulith.ApplicationModule
import org.springframework.modulith.PackageInfo

/**
 * Media Module
 *
 * <p>This module is responsible for managing media assets (images, videos, documents)
 * for the Nos Ilha cultural heritage platform.</p>
 *
 * <p><strong>Responsibilities:</strong></p>
 * <ul>
 *   <li>Media file upload and storage (local filesystem for development)</li>
 *   <li>Media metadata management in PostgreSQL</li>
 *   <li>File serving via REST API</li>
 *   <li>Association of media with directory entries</li>
 * </ul>
 *
 * <p><strong>Storage Strategy:</strong></p>
 * <ul>
 *   <li>Development: Local filesystem storage</li>
 *   <li>Production: Cloud storage integration deferred</li>
 *   <li>Metadata: PostgreSQL via JPA (Media entity)</li>
 * </ul>
 *
 * <p><strong>Module Boundaries:</strong></p>
 * <ul>
 *   <li>Depends on: shared :: api, shared :: events</li>
 *   <li>Exposes: FileUploadController (REST API), MediaUploadedEvent</li>
 *   <li>Internal: MediaService, LocalFileStorageService, MediaRepository</li>
 * </ul>
 *
 * <p><strong>Event Communication:</strong></p>
 * <ul>
 *   <li>Listens to: DirectoryEntryCreatedEvent (from directory module)</li>
 *   <li>Publishes: MediaUploadedEvent</li>
 * </ul>
 *
 * <p><strong>Future Enhancements:</strong></p>
 * <ul>
 *   <li>Cloud storage integration (GCS or Supabase Storage)</li>
 *   <li>AI integration for automatic image tagging</li>
 * </ul>
 *
 * @since 1.0
 */
@PackageInfo
@ApplicationModule(
    displayName = "Media Module",
    allowedDependencies = ["shared :: api", "shared :: domain", "shared :: events"],
)
class MediaModuleMetadata
