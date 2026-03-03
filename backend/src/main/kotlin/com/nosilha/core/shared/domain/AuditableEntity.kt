package com.nosilha.core.shared.domain

import jakarta.persistence.Column
import jakarta.persistence.MappedSuperclass
import jakarta.persistence.PrePersist
import jakarta.persistence.PreUpdate
import java.time.LocalDateTime

/**
 * Abstract base class for entities that require audit tracking.
 *
 * <p>This class provides automatic timestamping for entity creation and updates
 * via JPA lifecycle callbacks. All entities that need audit information should
 * extend this class.</p>
 *
 * <p><strong>Features:</strong></p>
 * <ul>
 *   <li>Automatic createdAt timestamp on entity creation (@PrePersist)</li>
 *   <li>Automatic updatedAt timestamp on entity modification (@PreUpdate)</li>
 *   <li>Database-level constraints to ensure timestamps are always set</li>
 * </ul>
 *
 * <p><strong>Usage:</strong></p>
 * <pre>
 * {@code
 * @Entity
 * @Table(name = "directory_entries")
 * class DirectoryEntry : AuditableEntity() {
 *     // Entity fields...
 * }
 * }
 * </pre>
 *
 * @see PrePersist
 * @see PreUpdate
 */
@MappedSuperclass
abstract class AuditableEntity {

    /**
     * Timestamp when the entity was first persisted to the database.
     * Automatically set on entity creation via @PrePersist callback.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

    /**
     * Timestamp when the entity was last updated in the database.
     * Automatically updated on entity modification via @PreUpdate callback.
     */
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()

    /**
     * JPA lifecycle callback to set createdAt and updatedAt timestamps on entity creation.
     * Called automatically before the entity is persisted for the first time.
     */
    @PrePersist
    protected fun onCreate() {
        val now = LocalDateTime.now()
        createdAt = now
        updatedAt = now
    }

    /**
     * JPA lifecycle callback to update updatedAt timestamp on entity modification.
     * Called automatically before the entity changes are flushed to the database.
     */
    @PreUpdate
    protected fun onUpdate() {
        updatedAt = LocalDateTime.now()
    }
}
