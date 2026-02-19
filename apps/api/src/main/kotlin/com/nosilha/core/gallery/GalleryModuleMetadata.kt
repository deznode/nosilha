package com.nosilha.core.gallery

import org.springframework.modulith.ApplicationModule
import org.springframework.modulith.PackageInfo

/**
 * Gallery Module
 *
 * <p>This module is responsible for managing all gallery media assets (user-uploaded and
 * admin-curated external content) for the Nos Ilha cultural heritage platform.</p>
 *
 * <p><strong>Responsibilities:</strong></p>
 * <ul>
 *   <li>User-uploaded media: File upload via presigned URLs (direct browser-to-R2 uploads)</li>
 *   <li>External media: Admin-curated content from YouTube, Vimeo, SoundCloud, etc.</li>
 *   <li>Unified gallery metadata management in PostgreSQL using Single Table Inheritance</li>
 *   <li>Shared moderation workflow (pending_review → active/rejected → archived)</li>
 *   <li>Association of media with directory entries</li>
 * </ul>
 *
 * <p><strong>Storage Strategy:</strong></p>
 * <ul>
 *   <li>User Uploads: Cloudflare R2 (S3-compatible) with presigned PUT URLs</li>
 *   <li>External Media: Platform-hosted content with metadata references</li>
 *   <li>Metadata: PostgreSQL via JPA (GalleryMedia hierarchy with Single Table Inheritance)</li>
 *   <li>CDN: R2 public access via custom domain (user uploads only)</li>
 * </ul>
 *
 * <p><strong>Module Boundaries:</strong></p>
 * <ul>
 *   <li>Depends on: shared :: api, shared :: domain, shared :: events, shared :: exception, auth (UserProfileQueryService for display names), ai (AiFeatureConfigService for domain guards)</li>
 *   <li>Exposes: MediaController, AdminMediaController (REST APIs), MediaUploadedEvent</li>
 *   <li>Internal: MediaService, R2StorageService, MediaRepository</li>
 * </ul>
 *
 * <p><strong>Event Communication:</strong></p>
 * <ul>
 *   <li>Listens to: DirectoryEntryCreatedEvent (from places module)</li>
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
    displayName = "Gallery Module",
    allowedDependencies = ["shared :: api", "shared :: domain", "shared :: events", "shared :: exception", "auth", "ai"],
    type = ApplicationModule.Type.OPEN,
)
class GalleryModuleMetadata
