package com.nosilha.core.ai.domain

import com.nosilha.core.shared.domain.AuditableEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

/**
 * Entity tracking monthly API usage per provider.
 *
 * Each row represents a provider's usage for a specific month (e.g., "cloud-vision" + "2026-02").
 * The unique constraint on (provider, year_month) ensures one record per provider per month.
 */
@Entity
@Table(name = "ai_api_usage")
class ApiUsageRecord(
    @Column(name = "provider", nullable = false, length = 50)
    val provider: String,
    @Column(name = "year_month", nullable = false, length = 7)
    val yearMonth: String,
    @Column(name = "monthly_limit", nullable = false)
    var monthlyLimit: Int,
) : AuditableEntity() {
    @Id
    @GeneratedValue
    var id: UUID? = null

    @Column(name = "request_count", nullable = false)
    var requestCount: Int = 0

    @Column(name = "last_request_at")
    var lastRequestAt: Instant? = null
}
