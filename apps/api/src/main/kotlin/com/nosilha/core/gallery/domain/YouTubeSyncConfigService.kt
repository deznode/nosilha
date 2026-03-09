package com.nosilha.core.gallery.domain

import com.nosilha.core.gallery.repository.YouTubeSyncConfigRepository
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

private val logger = KotlinLogging.logger {}

/**
 * Manages YouTube sync runtime configuration.
 *
 * <p>Reads and updates the single-row {@code youtube_sync_config} table,
 * enabling admins to toggle the feature and set defaults without
 * restarting the server.</p>
 */
@Service
@Transactional(readOnly = true)
class YouTubeSyncConfigService(
    private val repository: YouTubeSyncConfigRepository,
) {
    /**
     * Returns the current YouTube sync configuration.
     *
     * <p>Falls back to a disabled default if no DB row exists.</p>
     */
    fun getConfig(): YouTubeSyncConfigEntity =
        repository.findAll().firstOrNull() ?: run {
            logger.warn { "YouTube sync config not found, returning disabled default" }
            YouTubeSyncConfigEntity(enabled = false)
        }

    /**
     * Whether YouTube sync is enabled at runtime.
     */
    fun isEnabled(): Boolean = getConfig().enabled

    /**
     * Updates YouTube sync configuration.
     *
     * @param enabled Whether sync is enabled
     * @param defaultCategory Default gallery category for synced videos
     * @param adminId UUID of the admin making the change
     * @return Updated config entity
     */
    @Transactional
    fun updateConfig(
        enabled: Boolean,
        defaultCategory: String?,
        adminId: UUID,
    ): YouTubeSyncConfigEntity {
        val config = repository.findAll().firstOrNull()
            ?: YouTubeSyncConfigEntity()

        config.enabled = enabled
        config.defaultCategory = defaultCategory?.ifBlank { null }
        logger.info { "Admin $adminId updated YouTube sync config: enabled=$enabled, defaultCategory=${config.defaultCategory}" }
        return repository.save(config)
    }
}
