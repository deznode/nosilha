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
 *   <li>Media file upload via presigned URLs (direct browser-to-R2 uploads)</li>
 *   <li>Media metadata management in PostgreSQL</li>
 *   <li>Moderation workflow (pending_review → available/deleted)</li>
 *   <li>Association of media with directory entries</li>
 * </ul>
 *
 * <p><strong>Storage Strategy:</strong></p>
 * <ul>
 *   <li>Storage: Cloudflare R2 (S3-compatible) with presigned PUT URLs</li>
 *   <li>Metadata: PostgreSQL via JPA (Media entity with status lifecycle)</li>
 *   <li>CDN: R2 public access via custom domain</li>
 * </ul>
 *
 * <p><strong>Module Boundaries:</strong></p>
 * <ul>
 *   <li>Depends on: shared :: api, shared :: domain, shared :: events, shared :: exception</li>
 *   <li>Exposes: MediaController (REST API), MediaUploadedEvent</li>
 *   <li>Internal: MediaService, R2StorageService, MediaRepository</li>
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
 *   <li>Cloud import from Google Photos and Adobe Lightroom</li>
 *   <li>AI integration for automatic image tagging</li>
 * </ul>
 *
 * @since 1.0
 */
@PackageInfo
@ApplicationModule(
    displayName = "Media Module",
    allowedDependencies = ["shared :: api", "shared :: domain", "shared :: events", "shared :: exception"],
    type = ApplicationModule.Type.OPEN,
)
class MediaModuleMetadata
