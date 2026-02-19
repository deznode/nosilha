package com.nosilha.core.gallery.domain

import com.nosilha.core.shared.domain.AuditableEntity
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

/**
 * Abstract base class for all gallery media items using Single Table Inheritance.
 *
 * This entity unifies user-uploaded media and admin-curated external content
 * into a single gallery system with shared moderation workflow and metadata fields.
 *
 * Inheritance Hierarchy:
 * <pre>
 * AuditableEntity (shared kernel - provides createdAt, updatedAt)
 * └── GalleryMedia (gallery module - base gallery media)
 *     ├── UserUploadedMedia (@DiscriminatorValue("USER_UPLOAD"))
 *     └── ExternalMedia (@DiscriminatorValue("EXTERNAL"))
 * </pre>
 *
 * Storage Strategy:
 * - User Uploads: Cloudflare R2 with presigned URL uploads (UserUploadedMedia)
 * - External Media: Platform-hosted content with metadata references (ExternalMedia)
 * - All metadata stored in PostgreSQL
 *
 * Moderation Workflow:
 * - User Uploads: PROCESSING → PENDING_REVIEW → ACTIVE/REJECTED → ARCHIVED
 * - External Media: PENDING_REVIEW → ACTIVE → ARCHIVED
 *
 * @see AuditableEntity
 * @see GalleryMediaStatus
 * @see UserUploadedMedia
 * @see ExternalMedia
 */
@Entity
@Table(
    name = "gallery_media",
    indexes = [
        Index(name = "idx_gallery_media_status", columnList = "status"),
        Index(name = "idx_gallery_media_source", columnList = "media_source"),
        Index(name = "idx_gallery_media_category", columnList = "category"),
        Index(name = "idx_gallery_media_display_order", columnList = "display_order"),
    ]
)
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "media_source", discriminatorType = DiscriminatorType.STRING)
abstract class GalleryMedia : AuditableEntity() {
    /** Primary key (UUID, auto-generated). */
    @Id
    @GeneratedValue
    var id: UUID? = null

    /** Display title for the media item. */
    @Column(nullable = false, length = 255)
    var title: String = ""

    /** User-provided description of the media. */
    @Column(name = "description", length = 2048)
    var description: String? = null

    /** Category of the media (e.g., "hero", "gallery", "Historical", "Nature"). */
    @Column(name = "category", length = 100)
    var category: String? = null

    /** Display order for sorting within a collection. */
    @Column(name = "display_order", nullable = false)
    var displayOrder: Int = 0

    /** Current lifecycle state of the media. */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    var status: GalleryMediaStatus = GalleryMediaStatus.PENDING_REVIEW

    /**
     * The discriminator column indicating media source type.
     * This property is managed by JPA and should not be set manually.
     * It is marked as read-only (insertable=false, updatable=false).
     * The value is determined by the @DiscriminatorValue of the concrete subclass.
     */
    @Column(name = "media_source", nullable = false, insertable = false, updatable = false)
    lateinit var mediaSource: String

    // --- Moderation audit fields (shared across all media types) ---

    /** Admin user who approved or rejected the media. */
    @Column(name = "reviewed_by")
    var reviewedBy: UUID? = null

    /** Timestamp of approval or rejection. */
    @Column(name = "reviewed_at")
    var reviewedAt: Instant? = null

    /** Reason provided when media is rejected. */
    @Column(name = "rejection_reason", length = 1024)
    var rejectionReason: String? = null

    /** Queue priority for moderation (0=normal, 1=low, 2=medium, 3=high). */
    @Column(name = "severity")
    var severity: Int? = 0

    // --- Smart credit attribution (shared across all media types) ---

    /** Detected social platform for creator credit (e.g., YOUTUBE, INSTAGRAM). */
    @Enumerated(EnumType.STRING)
    @Column(name = "credit_platform", length = 30)
    var creditPlatform: CreditPlatform? = null

    /** Normalized social media handle (without @ prefix). */
    @Column(name = "credit_handle", length = 100)
    var creditHandle: String? = null

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as GalleryMedia

        return id != null && id == other.id
    }

    override fun hashCode(): Int = id?.hashCode() ?: 31

    override fun toString(): String = "${this.javaClass.simpleName}(id=$id, title='$title', status='$status', mediaSource='$mediaSource')"
}
