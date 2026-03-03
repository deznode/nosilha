package com.nosilha.core.gallery.api

import com.nosilha.core.gallery.domain.GalleryMediaStatus

/**
 * Query service interface for cross-module media statistics.
 * Used by feedback module's DashboardService for admin dashboard.
 */
interface MediaQueryService {
    fun countByStatus(status: GalleryMediaStatus): Long
}
