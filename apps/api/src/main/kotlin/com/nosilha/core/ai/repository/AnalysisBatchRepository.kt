package com.nosilha.core.ai.repository

import com.nosilha.core.ai.domain.AnalysisBatch
import com.nosilha.core.ai.domain.BatchStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

/**
 * Repository for AI analysis batch records.
 */
interface AnalysisBatchRepository : JpaRepository<AnalysisBatch, UUID> {
    fun findByStatus(status: BatchStatus): List<AnalysisBatch>

    fun findByRequestedBy(
        requestedBy: UUID,
        pageable: Pageable,
    ): Page<AnalysisBatch>

    fun findAllByOrderByCreatedAtDesc(pageable: Pageable): Page<AnalysisBatch>

    @Modifying
    @Query(
        """
        UPDATE ai_analysis_batch
        SET completed_items = completed_items + 1,
            updated_at = now(),
            status = CASE
                WHEN (completed_items + 1 + failed_items) >= total_items THEN
                    CASE WHEN failed_items = 0 THEN 'COMPLETED' ELSE 'PARTIALLY_COMPLETED' END
                WHEN status = 'PENDING' THEN 'PROCESSING'
                ELSE status
            END,
            completed_at = CASE
                WHEN (completed_items + 1 + failed_items) >= total_items THEN now()
                ELSE completed_at
            END
        WHERE id = :batchId
        """,
        nativeQuery = true,
    )
    fun incrementCompletedAndUpdateStatus(
        @Param("batchId") batchId: UUID,
    ): Int

    @Modifying
    @Query(
        """
        UPDATE ai_analysis_batch
        SET failed_items = failed_items + 1,
            updated_at = now(),
            status = CASE
                WHEN (completed_items + failed_items + 1) >= total_items THEN
                    CASE WHEN completed_items = 0 THEN 'FAILED' ELSE 'PARTIALLY_COMPLETED' END
                WHEN status = 'PENDING' THEN 'PROCESSING'
                ELSE status
            END,
            completed_at = CASE
                WHEN (completed_items + failed_items + 1) >= total_items THEN now()
                ELSE completed_at
            END
        WHERE id = :batchId
        """,
        nativeQuery = true,
    )
    fun incrementFailedAndUpdateStatus(
        @Param("batchId") batchId: UUID,
    ): Int
}
