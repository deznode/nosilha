package com.nosilha.core.places.domain

import com.nosilha.core.shared.domain.AuditableEntity
import jakarta.persistence.Column
import jakarta.persistence.DiscriminatorColumn
import jakarta.persistence.DiscriminatorType
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.Inheritance
import jakarta.persistence.InheritanceType
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

/**
 * Abstract base class for all directory entries on the Nos Ilha platform.
 *
 * <p>This entity uses a SINGLE_TABLE inheritance strategy, where all subclasses
 * (e.g., Restaurant, Hotel, Heritage, Nature, Beach) are stored in the `directory_entries` table.
 * The `category` column is used as the discriminator to determine the specific
 * subtype of each row.</p>
 *
 * <p><strong>Inheritance Hierarchy:</strong></p>
 * <pre>
 * AuditableEntity (shared kernel - provides createdAt, updatedAt)
 * └── DirectoryEntry (directory module - base directory entry)
 *     ├── Restaurant (@DiscriminatorValue("Restaurant"))
 *     ├── Hotel (@DiscriminatorValue("Hotel"))
 *     ├── Beach (@DiscriminatorValue("Beach"))
 *     ├── Heritage (@DiscriminatorValue("Heritage"))
 *     └── Nature (@DiscriminatorValue("Nature"))
 * </pre>
 *
 * @see com.nosilha.core.shared.domain.AuditableEntity
 */
@Entity
@Table(name = "directory_entries")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "category", discriminatorType = DiscriminatorType.STRING)
abstract class DirectoryEntry : AuditableEntity() {
    @Id
    @GeneratedValue
    var id: UUID? = null

    @Column(nullable = false)
    lateinit var name: String

    @Column(unique = true, nullable = false)
    lateinit var slug: String

    @Column(length = 2048)
    lateinit var description: String

    /**
     * The discriminator column. This property is managed by JPA and should not be
     * set manually. It is marked as read-only (insertable=false, updatable=false)
     * to enforce this. The value is determined by the @DiscriminatorValue of the
     * concrete subclass.
     */
    @Column(name = "category", nullable = false, insertable = false, updatable = false)
    lateinit var category: String

    @Column(nullable = false)
    lateinit var town: String

    @Column(nullable = false)
    var latitude: Double = 0.0

    @Column(nullable = false)
    var longitude: Double = 0.0

    var imageUrl: String? = null

    var rating: Double? = null // Nullable to indicate no ratings yet

    var reviewCount: Int = 0

    @Column(name = "tags")
    var tags: String? = null

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "content_actions", columnDefinition = "jsonb")
    var contentActions: String? = null

    // --- Subclass-specific fields, nullable in the base table ---

    // Contact fields
    var phoneNumber: String? = null
    var email: String? = null
    var website: String? = null

    // Restaurant-specific fields
    var openingHours: String? = null // e.g., "Mon-Fri 09:00-22:00; Sat 10:00-23:00"
    var cuisine: String? = null // e.g., "Cape Verdean,Seafood,International"

    // Hotel-specific fields
    var amenities: String? = null // e.g., "Wi-Fi,Pool,Air Conditioning"

    // --- Moderation/Lifecycle fields (DDD Aggregate pattern) ---

    /**
     * Lifecycle status: DRAFT, PENDING, APPROVED, PUBLISHED, ARCHIVED.
     * Default is PUBLISHED for backward compatibility with seeded data.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: DirectoryEntryStatus = DirectoryEntryStatus.PUBLISHED

    /** User ID of the community member who submitted (null for seeded entries) */
    @Column(name = "submitted_by")
    var submittedBy: String? = null

    /** Email of the submitter (optional, for contact) */
    @Column(name = "submitted_by_email")
    var submittedByEmail: String? = null

    /** Submitter IP address for rate limiting (IPv4 or IPv6) */
    @Column(name = "ip_address", length = 45)
    var ipAddress: String? = null

    /** Admin notes for moderation decisions */
    @Column(name = "admin_notes", columnDefinition = "TEXT")
    var adminNotes: String? = null

    /** User ID of admin who reviewed the submission */
    @Column(name = "reviewed_by")
    var reviewedBy: String? = null

    /** Timestamp when submission was reviewed */
    @Column(name = "reviewed_at")
    var reviewedAt: Instant? = null

    /** Price level indicator: $, $$, or $$$ */
    @Column(name = "price_level", length = 5)
    var priceLevel: String? = null

    /** Custom town name if not in predefined list */
    @Column(name = "custom_town", length = 100)
    var customTown: String? = null

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        // Use javaClass to ensure the comparison is between the same concrete subclasses
        if (javaClass != other?.javaClass) return false

        other as DirectoryEntry

        // An entity is defined by its ID. If null, it's only equal to itself.
        return id != null && id == other.id
    }

    override fun hashCode(): Int {
        // For transient entities (id is null), return a constant.
        // Otherwise, use the hashcode of the unique ID.
        return id?.hashCode() ?: 31
    }

    override fun toString(): String {
        // Dynamically includes the concrete class name (e.g., "Restaurant")
        return "${this.javaClass.simpleName}(id=$id, name='$name', category='${getCategoryValue()}')"
    }
}
