package com.nosilha.core.ai.domain

import com.nosilha.core.ai.repository.ApiUsageRepository
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.YearMonth
import java.time.format.DateTimeFormatter

private val logger = KotlinLogging.logger {}

/**
 * Tracks and enforces monthly API usage quotas per provider.
 */
@Service
class ApiUsageService(
    private val apiUsageRepository: ApiUsageRepository,
) {
    companion object {
        private val YEAR_MONTH_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM")
    }

    /**
     * Atomically check quota and increment usage in a single operation.
     *
     * Attempts to increment the request count for the provider's current month record
     * only if the count is below the monthly limit. If no record exists, creates one
     * with count=1 (first request this month).
     *
     * @return true if quota was available and usage was incremented
     */
    @Transactional
    fun checkAndIncrementQuota(
        provider: String,
        monthlyLimit: Int,
    ): Boolean {
        val yearMonth = currentYearMonth()
        val rowsUpdated = apiUsageRepository.incrementIfUnderQuota(provider, yearMonth)
        if (rowsUpdated == 1) return true

        // No row updated: either no record exists or quota exceeded
        val existing = apiUsageRepository.findByProviderAndYearMonth(provider, yearMonth)
        if (existing != null) return false // quota exceeded

        // First request this month — create record with count=1
        apiUsageRepository.save(
            ApiUsageRecord(
                provider = provider,
                yearMonth = yearMonth,
                monthlyLimit = monthlyLimit,
            ).apply {
                requestCount = 1
                lastRequestAt = Instant.now()
            },
        )
        return true
    }

    /**
     * Get current usage for a provider.
     *
     * @return pair of (current count, monthly limit), or (0, monthlyLimit) if no record exists
     */
    fun getUsage(
        provider: String,
        monthlyLimit: Int,
    ): UsageInfo {
        val yearMonth = currentYearMonth()
        val record = apiUsageRepository.findByProviderAndYearMonth(provider, yearMonth)
        return UsageInfo(
            provider = provider,
            count = record?.requestCount ?: 0,
            limit = record?.monthlyLimit ?: monthlyLimit,
            yearMonth = yearMonth,
        )
    }

    private fun currentYearMonth(): String = YearMonth.now().format(YEAR_MONTH_FORMAT)
}

/**
 * Current API usage info for a provider.
 */
data class UsageInfo(
    val provider: String,
    val count: Int,
    val limit: Int,
    val yearMonth: String,
) {
    val percentUsed: Double
        get() = if (limit > 0) (count.toDouble() / limit) * 100.0 else 0.0
}
