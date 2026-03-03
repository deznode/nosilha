package com.nosilha.core.stories

import org.springframework.modulith.ApplicationModule
import org.springframework.modulith.PackageInfo

/**
 * Stories Module
 *
 * Manages community-submitted cultural heritage narratives including:
 * - Story submissions (quick, full, guided, photo types)
 * - Story moderation workflow (pending → approved → published)
 * - MDX generation and archival for published stories
 *
 * Module Boundaries:
 * - Depends on: shared (base classes, events, exceptions), auth (user profiles), places (related places)
 * - Exposes: Controllers, DTOs, StoriesQueryService (public API)
 * - Internal: StoryService, repositories (package-private)
 */
@PackageInfo
@ApplicationModule(
    displayName = "Stories Module",
    allowedDependencies = [
        "shared :: api",
        "shared :: domain",
        "shared :: events",
        "shared :: exception",
        "shared :: util",
        "auth",
        "places",
    ],
    type = ApplicationModule.Type.OPEN,
)
class StoriesModuleMetadata
