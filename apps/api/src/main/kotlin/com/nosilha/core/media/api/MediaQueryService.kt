package com.nosilha.core.media.api

import com.nosilha.core.media.domain.MediaStatus

/**
 * Query service interface for cross-module media statistics.
 * Used by feedback module's DashboardService for admin dashboard.
 */
interface MediaQueryService {
    fun countByStatus(status: MediaStatus): Long
}
