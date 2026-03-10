package com.nosilha.core.ai.repository

import com.nosilha.core.ai.domain.AnalysisRun
import com.nosilha.core.ai.domain.ModerationStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

/**
 * Repository for AI analysis run records.
 */
interface AnalysisRunRepository : JpaRepository<AnalysisRun, UUID> {
    fun findByMediaId(mediaId: UUID): List<AnalysisRun>

    fun findByBatchId(batchId: UUID): List<AnalysisRun>

    fun findByModerationStatus(
        moderationStatus: ModerationStatus,
        pageable: Pageable,
    ): Page<AnalysisRun>

    fun findTopByMediaIdOrderByCreatedAtDesc(mediaId: UUID): AnalysisRun?

    @Query(
        value = """
            SELECT DISTINCT ON (media_id) *
            FROM ai_analysis_log
            WHERE media_id IN (:mediaIds)
            ORDER BY media_id, created_at DESC
        """,
        nativeQuery = true,
    )
    fun findLatestByMediaIds(
        @Param("mediaIds") mediaIds: List<UUID>,
    ): List<AnalysisRun>
}
