package com.nosilha.core.ai.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.PrePersist
import jakarta.persistence.PreUpdate
import jakarta.persistence.Table
import java.time.Instant
import java.time.LocalDateTime
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
) {
    @Id
    var id: UUID? = null

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

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()

    @PrePersist
    protected fun onCreate() {
        if (id == null) id = UUID.randomUUID()
        val now = LocalDateTime.now()
        createdAt = now
        updatedAt = now
    }

    @PreUpdate
    protected fun onUpdate() {
        updatedAt = LocalDateTime.now()
    }
}
