package com.nosilha.core.ai.repository

import com.nosilha.core.ai.domain.AnalysisBatch
import com.nosilha.core.ai.domain.BatchStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
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
}
