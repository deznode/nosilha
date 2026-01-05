package com.nosilha.core.feedback

import org.springframework.modulith.ApplicationModule
import org.springframework.modulith.PackageInfo

/**
 * Feedback Module
 *
 * Manages community feedback channels including:
 * - Suggestions (corrections, additions, feedback on existing content)
 * - Directory submissions (user-proposed new locations)
 * - Contact messages (general inquiries)
 * - Admin dashboard (aggregate statistics from all modules)
 *
 * Module Boundaries:
 * - Depends on: shared, auth, directory, stories, engagement, media (for dashboard queries)
 * - Exposes: Controllers, DTOs, DashboardService (public API)
 * - Internal: repositories, domain entities (package-private)
 */
@PackageInfo
@ApplicationModule(
    displayName = "Feedback Module",
    allowedDependencies = [
        "shared :: api",
        "shared :: domain",
        "shared :: events",
        "shared :: exception",
        "shared :: util",
        "auth",
        "directory",
        "stories",
        "engagement",
        "media",
    ],
    type = ApplicationModule.Type.OPEN,
)
class FeedbackModuleMetadata
