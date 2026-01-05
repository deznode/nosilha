package com.nosilha.core.engagement

import org.springframework.modulith.ApplicationModule
import org.springframework.modulith.PackageInfo

/**
 * Engagement Module
 *
 * Manages user interactions with published content including:
 * - Reactions (love, celebrate, insightful, support)
 * - Bookmarks (saved place entries)
 * - Content registration for reaction tracking
 *
 * Module Boundaries:
 * - Depends on: shared (base classes, events, exceptions), places (entry validation)
 * - Exposes: Controllers and DTOs (public API)
 * - Internal: Services, repositories (package-private)
 */
@PackageInfo
@ApplicationModule(
    displayName = "Engagement Module",
    allowedDependencies = [
        "shared :: api",
        "shared :: domain",
        "shared :: events",
        "shared :: exception",
        "shared :: util",
        "places",
    ],
    type = ApplicationModule.Type.OPEN,
)
class EngagementModuleMetadata
