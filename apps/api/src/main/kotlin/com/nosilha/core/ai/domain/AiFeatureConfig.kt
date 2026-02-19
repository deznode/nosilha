package com.nosilha.core.ai.domain

import com.nosilha.core.shared.domain.AuditableEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.util.UUID

/**
 * Domain-level AI feature toggle.
 *
 * <p>Each row controls whether AI is enabled for a specific domain
 * (gallery, stories, directory). Admins toggle these at runtime
 * via the AI Dashboard.</p>
 */
@Entity
@Table(name = "ai_feature_config")
class AiFeatureConfig(
    @Column(name = "domain", nullable = false, unique = true, length = 50)
    val domain: String,
    @Column(name = "enabled", nullable = false)
    var enabled: Boolean = false,
) : AuditableEntity() {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    var id: UUID? = null
}
