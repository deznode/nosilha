package com.nosilha.core.ai.domain

import com.nosilha.core.shared.domain.AuditableEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.PostLoad
import jakarta.persistence.PostPersist
import jakarta.persistence.Table
import jakarta.persistence.Transient
import org.springframework.data.domain.Persistable
import java.time.Instant
import java.util.UUID

/**
 * Status of a batch analysis request.
 */
enum class BatchStatus {
    PENDING,
    PROCESSING,
    COMPLETED,
    PARTIALLY_COMPLETED,
    FAILED,
}

/**
 * Entity representing a batch of AI analysis requests.
 *
 * Tracks overall progress of a batch: total items, completed, and failed counts.
 *
 * @see com.nosilha.core.ai.domain.AnalysisRun
 */
@Entity
@Table(name = "ai_analysis_batch")
class AnalysisBatch(
    @Column(name = "total_items", nullable = false)
    val totalItems: Int,
    @Column(name = "requested_by", nullable = false)
    val requestedBy: UUID,
) : AuditableEntity(),
    Persistable<UUID> {
    @Id
    private var id: UUID? = null

    @Transient
    private var isNew: Boolean = true

    override fun getId(): UUID? = id

    override fun isNew(): Boolean = isNew

    fun assignId(newId: UUID) {
        this.id = newId
    }

    @PostLoad
    @PostPersist
    private fun markNotNew() {
        isNew = false
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    var status: BatchStatus = BatchStatus.PENDING

    @Column(name = "completed_items", nullable = false)
    var completedItems: Int = 0

    @Column(name = "failed_items", nullable = false)
    var failedItems: Int = 0

    @Column(name = "started_at")
    var startedAt: Instant? = null

    @Column(name = "completed_at")
    var completedAt: Instant? = null
}
