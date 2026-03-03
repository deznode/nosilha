package com.nosilha.core.ai.repository

import com.nosilha.core.ai.domain.ApiUsageRecord
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

/**
 * Repository for AI API usage tracking records.
 */
interface ApiUsageRepository : JpaRepository<ApiUsageRecord, UUID> {
    fun findByProviderAndYearMonth(
        provider: String,
        yearMonth: String,
    ): ApiUsageRecord?

    @Modifying
    @Query(
        """
        UPDATE ai_api_usage
        SET request_count = request_count + 1,
            last_request_at = now(),
            updated_at = now()
        WHERE provider = :provider
          AND year_month = :yearMonth
          AND request_count < monthly_limit
        """,
        nativeQuery = true,
    )
    fun incrementIfUnderQuota(
        @Param("provider") provider: String,
        @Param("yearMonth") yearMonth: String,
    ): Int
}
