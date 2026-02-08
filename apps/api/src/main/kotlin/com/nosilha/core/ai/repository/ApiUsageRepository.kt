package com.nosilha.core.ai.repository

import com.nosilha.core.ai.domain.ApiUsageRecord
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

/**
 * Repository for AI API usage tracking records.
 */
interface ApiUsageRepository : JpaRepository<ApiUsageRecord, UUID> {
    fun findByProviderAndYearMonth(
        provider: String,
        yearMonth: String,
    ): ApiUsageRecord?
}
