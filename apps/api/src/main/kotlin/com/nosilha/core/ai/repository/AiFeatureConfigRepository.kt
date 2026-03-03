package com.nosilha.core.ai.repository

import com.nosilha.core.ai.domain.AiFeatureConfig
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

/**
 * Repository for AI domain feature config records.
 */
interface AiFeatureConfigRepository : JpaRepository<AiFeatureConfig, UUID> {
    fun findByDomain(domain: String): AiFeatureConfig?

    fun findAllByOrderByDomain(): List<AiFeatureConfig>
}
