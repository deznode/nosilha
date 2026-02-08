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
     * Check if the provider is within its monthly quota.
     *
     * @return true if the provider has remaining quota
     */
    fun checkQuota(
        provider: String,
        monthlyLimit: Int,
    ): Boolean {
        val yearMonth = currentYearMonth()
        val record = apiUsageRepository.findByProviderAndYearMonth(provider, yearMonth)
        if (record == null) return true
        return record.requestCount < record.monthlyLimit
    }

    /**
     * Atomically increment the usage counter for a provider.
     * Creates a new record if none exists for the current month.
     */
    @Transactional
    fun incrementUsage(
        provider: String,
        monthlyLimit: Int,
    ) {
        val yearMonth = currentYearMonth()
        val record = apiUsageRepository.findByProviderAndYearMonth(provider, yearMonth)
            ?: ApiUsageRecord(
                provider = provider,
                yearMonth = yearMonth,
                monthlyLimit = monthlyLimit,
            )
        record.requestCount += 1
        record.lastRequestAt = Instant.now()
        apiUsageRepository.save(record)
        logger.debug { "API usage for $provider ($yearMonth): ${record.requestCount}/${record.monthlyLimit}" }
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
