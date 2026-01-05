package com.nosilha.core.auth

import org.springframework.modulith.ApplicationModule

/**
 * Auth Module - User authentication, authorization, and profile management
 *
 * <p>This module handles all authentication-related concerns including JWT validation,
 * user profile management, and authorization via Supabase integration.</p>
 *
 * <h3>Dependencies:</h3>
 * <ul>
 *   <li><b>shared :: api</b> - ApiResult, PagedApiResult for controller responses</li>
 *   <li><b>shared :: domain</b> - AuditableEntity base class for UserProfile</li>
 *   <li><b>shared :: events</b> - ApplicationModuleEvent base for auth events</li>
 *   <li><b>shared :: exception</b> - Common exceptions (ResourceNotFoundException, RateLimitExceededException)</li>
 *   <li><b>engagement</b> - Profile contributions view requires read-only access to reactions/bookmarks</li>
 *   <li><b>stories</b> - Profile contributions view requires read-only access to story submissions</li>
 *   <li><b>feedback</b> - Profile contributions view requires read-only access to suggestions</li>
 * </ul>
 *
 * <h3>Exposed APIs:</h3>
 * <ul>
 *   <li>{@link com.nosilha.core.auth.api.ProfileController} - REST endpoints for profile management</li>
 *   <li>{@link com.nosilha.core.auth.api.UserProfileQueryService} - Query service for cross-module profile lookups</li>
 * </ul>
 *
 * <h3>Published Events:</h3>
 * <ul>
 *   <li>{@link com.nosilha.core.auth.events.UserLoggedInEvent} - Published when user authenticates</li>
 *   <li>{@link com.nosilha.core.auth.events.UserLoggedOutEvent} - Published when user logs out</li>
 * </ul>
 *
 * @since 1.0
 */
@ApplicationModule(
    displayName = "Auth Module",
    allowedDependencies = [
        "shared :: api",
        "shared :: domain",
        "shared :: events",
        "shared :: exception",
        "engagement",
        "stories",
        "feedback",
    ],
    type = ApplicationModule.Type.OPEN,
)
class AuthModuleMetadata
