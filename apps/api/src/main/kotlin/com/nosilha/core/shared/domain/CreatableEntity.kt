package com.nosilha.core.shared.domain

import jakarta.persistence.Column
import jakarta.persistence.EntityListeners
import jakarta.persistence.MappedSuperclass
import org.springframework.data.annotation.CreatedBy
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant
import java.util.UUID

/**
 * Base class for immutable entities that only need creation audit tracking.
 *
 * <p>Provides automatic timestamping and user tracking via Spring Data JPA Auditing.
 * Entities that are created once and never updated should extend this class.
 * For entities that need update tracking, extend {@link AuditableEntity} instead.</p>
 *
 * @see AuditableEntity
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener::class)
abstract class CreatableEntity {
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: Instant = Instant.now()

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    var createdBy: UUID? = null
}
