package com.nosilha.core.shared.domain

import jakarta.persistence.Column
import jakarta.persistence.MappedSuperclass
import org.springframework.data.annotation.LastModifiedBy
import org.springframework.data.annotation.LastModifiedDate
import java.time.Instant
import java.util.UUID

/**
 * Base class for mutable entities that need both creation and update audit tracking.
 *
 * <p>Extends {@link CreatableEntity} to add automatic last-modified timestamping
 * and user tracking via Spring Data JPA Auditing. Entities that can be updated
 * after creation should extend this class.</p>
 *
 * @see CreatableEntity
 */
@MappedSuperclass
abstract class AuditableEntity : CreatableEntity() {
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()

    @LastModifiedBy
    @Column(name = "updated_by")
    var updatedBy: UUID? = null
}
