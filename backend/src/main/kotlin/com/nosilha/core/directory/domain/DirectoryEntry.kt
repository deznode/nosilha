package com.nosilha.core.directory.domain

import com.nosilha.core.shared.domain.AuditableEntity
import jakarta.persistence.Column
import jakarta.persistence.DiscriminatorColumn
import jakarta.persistence.DiscriminatorType
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.Inheritance
import jakarta.persistence.InheritanceType
import jakarta.persistence.Table
import java.util.UUID

/**
 * Abstract base class for all directory entries on the Nos Ilha platform.
 *
 * <p>This entity uses a SINGLE_TABLE inheritance strategy, where all subclasses
 * (e.g., Restaurant, Hotel, Landmark, Beach) are stored in the `directory_entries` table.
 * The `category` column is used as the discriminator to determine the specific
 * subtype of each row.</p>
 *
 * <p><strong>Inheritance Hierarchy:</strong></p>
 * <pre>
 * AuditableEntity (shared kernel - provides createdAt, updatedAt)
 * └── DirectoryEntry (directory module - base directory entry)
 *     ├── Restaurant (@DiscriminatorValue("RESTAURANT"))
 *     ├── Hotel (@DiscriminatorValue("HOTEL"))
 *     ├── Landmark (@DiscriminatorValue("LANDMARK"))
 *     └── Beach (@DiscriminatorValue("BEACH"))
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

    // --- Subclass-specific fields, nullable in the base table ---

    // Restaurant-specific fields
    var phoneNumber: String? = null
    var openingHours: String? = null // e.g., "Mon-Fri 09:00-22:00; Sat 10:00-23:00"
    var cuisine: String? = null // e.g., "Cape Verdean,Seafood,International"

    // Hotel-specific fields
    var amenities: String? = null // e.g., "Wi-Fi,Pool,Air Conditioning"

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
