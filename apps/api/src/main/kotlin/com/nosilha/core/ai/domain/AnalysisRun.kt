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
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import org.springframework.data.domain.Persistable
import java.time.Instant
import java.util.UUID

/**
 * Status of an individual analysis run.
 */
enum class AnalysisRunStatus {
    PENDING,
    PROCESSING,
    COMPLETED,
    FAILED,
}

/**
 * Moderation status for AI-generated results.
 */
enum class ModerationStatus {
    PENDING_REVIEW,
    APPROVED,
    REJECTED,
}

/**
 * Entity representing a single AI analysis execution for a gallery media item.
 *
 * Tracks the full lifecycle: PENDING → PROCESSING → COMPLETED/FAILED,
 * plus moderation workflow: PENDING_REVIEW → APPROVED/REJECTED.
 *
 * @see com.nosilha.core.ai.domain.AnalysisBatch
 */
@Entity
@Table(name = "ai_analysis_log")
class AnalysisRun(
    @Column(name = "media_id", nullable = false)
    val mediaId: UUID,
    @Column(name = "requested_by", nullable = false)
    val requestedBy: UUID,
    @Column(name = "batch_id")
    var batchId: UUID? = null,
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
    @Column(name = "status", nullable = false, length = 20)
    var status: AnalysisRunStatus = AnalysisRunStatus.PENDING

    @Column(name = "providers_used", columnDefinition = "TEXT[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    var providersUsed: Array<String>? = null

    @Column(name = "raw_results", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    var rawResults: String? = null

    @Column(name = "result_tags", columnDefinition = "TEXT[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    var resultTags: Array<String>? = null

    @Column(name = "result_labels", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    var resultLabels: String? = null

    @Column(name = "result_alt_text", length = 1024)
    var resultAltText: String? = null

    @Column(name = "result_description", length = 2048)
    var resultDescription: String? = null

    @Enumerated(EnumType.STRING)
    @Column(name = "moderation_status", nullable = false, length = 20)
    var moderationStatus: ModerationStatus = ModerationStatus.PENDING_REVIEW

    @Column(name = "moderated_by")
    var moderatedBy: UUID? = null

    @Column(name = "moderated_at")
    var moderatedAt: Instant? = null

    @Column(name = "moderator_notes")
    var moderatorNotes: String? = null

    @Column(name = "error_message")
    var errorMessage: String? = null

    @Column(name = "started_at")
    var startedAt: Instant? = null

    @Column(name = "completed_at")
    var completedAt: Instant? = null
}
