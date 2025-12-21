package com.nosilha.core.media.domain

import com.nosilha.core.shared.domain.AuditableEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

/**
 * Entity representing uploaded media files with metadata.
 *
 * Stores media file information including storage location, file metadata,
 * and optional AI-generated annotations. This replaces the previous Firestore-based
 * ImageMetadata storage with a PostgreSQL-native solution.
 *
 * Storage Strategy:
 * - Development: Local filesystem storage (configurable path)
 * - Production: Cloud storage integration (deferred)
 *
 * AI Integration (Future):
 * The aiTags, aiLabels, aiAltText, aiDescription, and aiProcessedAt fields are
 * placeholder columns for future Cloud Vision or similar AI integration. They remain
 * nullable until AI processing is implemented.
 *
 * @see AuditableEntity
 */
@Entity
@Table(name = "media")
class Media(
    /** Unique filename generated for storage (UUID-based). */
    @Column(name = "file_name", nullable = false)
    var fileName: String,
    /** Original filename as uploaded by the user. */
    @Column(name = "original_name", nullable = false)
    var originalName: String,
    /** MIME content type of the file (e.g., "image/jpeg", "image/png"). */
    @Column(name = "content_type", nullable = false, length = 100)
    var contentType: String,
    /** File size in bytes. */
    @Column(name = "file_size", nullable = false)
    var fileSize: Long,
    /** Absolute path where the file is stored on the filesystem. */
    @Column(name = "storage_path", nullable = false, length = 1024)
    var storagePath: String,
    /** Public URL for accessing the file via the API. */
    @Column(name = "public_url", length = 1024)
    var publicUrl: String? = null,
    /** Optional association with a directory entry. */
    @Column(name = "entry_id")
    var entryId: UUID? = null,
    /** Category of the media (e.g., "hero", "gallery", "document"). */
    @Column(name = "category", length = 100)
    var category: String? = null,
    /** User-provided description of the media. */
    @Column(name = "description", length = 2048)
    var description: String? = null,
    /** Display order for sorting within a collection. */
    @Column(name = "display_order", nullable = false)
    var displayOrder: Int = 0,
    /** AI-generated tags for image classification (PostgreSQL TEXT[] array). */
    @Column(name = "ai_tags", columnDefinition = "TEXT[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    var aiTags: Array<String>? = null,
    /** Structured AI labels with confidence scores (JSONB). */
    @Column(name = "ai_labels", columnDefinition = "JSONB")
    @JdbcTypeCode(SqlTypes.JSON)
    var aiLabels: String? = null,
    /** AI-generated alt text for accessibility. */
    @Column(name = "ai_alt_text", length = 1024)
    var aiAltText: String? = null,
    /** AI-generated description of the media content. */
    @Column(name = "ai_description", length = 2048)
    var aiDescription: String? = null,
    /** Timestamp when AI processing was completed. */
    @Column(name = "ai_processed_at")
    var aiProcessedAt: Instant? = null,
    /** User who uploaded the media. */
    @Column(name = "uploaded_by")
    var uploadedBy: String? = null,
) : AuditableEntity() {
    /** Primary key (UUID, auto-generated). */
    @Id
    @GeneratedValue
    var id: UUID? = null
}
