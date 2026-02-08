package com.nosilha.core.gallery.domain

import jakarta.persistence.Column
import jakarta.persistence.DiscriminatorValue
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

/**
 * Gallery media subclass for user-uploaded files stored in Cloudflare R2.
 *
 * Represents media files uploaded directly by users, including storage metadata,
 * file information, and AI-generated annotations.
 *
 * Storage Strategy:
 * - All environments: Cloudflare R2 with presigned URL uploads
 * - Metadata stored in PostgreSQL
 *
 * Moderation Workflow:
 * PROCESSING → PENDING_REVIEW → ACTIVE/REJECTED → ARCHIVED
 *
 * AI Integration (Future):
 * The aiTags and aiProcessedAt fields are placeholder columns for future
 * Cloud Vision or similar AI integration.
 *
 * @see GalleryMedia
 * @see GalleryMediaStatus
 * @see MediaSource
 */
@Entity
@DiscriminatorValue("USER_UPLOAD")
class UserUploadedMedia : GalleryMedia() {
    /** Unique filename generated for storage (UUID-based). */
    @Column(name = "file_name")
    var fileName: String? = null

    /** Original filename as uploaded by the user. */
    @Column(name = "original_name")
    var originalName: String? = null

    /** R2 object key (path within bucket). */
    @Column(name = "storage_key", length = 512)
    var storageKey: String? = null

    /** Public URL for accessing the file via CDN. */
    @Column(name = "public_url", length = 1024)
    var publicUrl: String? = null

    /** MIME content type of the file (e.g., "image/jpeg", "image/png"). */
    @Column(name = "content_type", length = 100)
    var contentType: String? = null

    /** File size in bytes. */
    @Column(name = "file_size")
    var fileSize: Long? = null

    /** Optional association with a directory entry. */
    @Column(name = "entry_id")
    var entryId: UUID? = null

    /** Upload origin (local device, Google Photos, Adobe Lightroom). */
    @Enumerated(EnumType.STRING)
    @Column(name = "upload_source")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    var source: MediaSource? = MediaSource.LOCAL

    /** External identifier for cloud-imported media (Phase 2). */
    @Column(name = "source_id", length = 512)
    var sourceId: String? = null

    /** User who uploaded the media. */
    @Column(name = "uploaded_by")
    var uploadedBy: String? = null

    // --- AI-generated fields (populated on moderation approval) ---

    /** AI-generated tags for image classification (PostgreSQL TEXT[] array). */
    @Column(name = "ai_tags", columnDefinition = "TEXT[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    var aiTags: Array<String>? = null

    /** AI-generated structured labels with confidence scores (JSONB). */
    @Column(name = "ai_labels", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    var aiLabels: String? = null

    /** AI-generated accessible alt text for the image. */
    @Column(name = "ai_alt_text", length = 1024)
    var aiAltText: String? = null

    /** AI-generated rich description of the image with cultural context. */
    @Column(name = "ai_description", length = 2048)
    var aiDescription: String? = null

    /** Timestamp when AI processing was completed. */
    @Column(name = "ai_processed_at")
    var aiProcessedAt: Instant? = null
}
