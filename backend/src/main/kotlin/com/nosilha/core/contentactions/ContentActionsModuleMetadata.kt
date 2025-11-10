package com.nosilha.core.contentactions

import org.springframework.modulith.ApplicationModule
import org.springframework.modulith.PackageInfo

/**
 * Content Actions Module
 *
 * <p>This module is responsible for managing user interactions with cultural heritage content,
 * including reactions and community suggestions for the Nos Ilha platform.
 *
 * <p><strong>Responsibilities:</strong>
 * <ul>
 *   <li>User reactions to content (love, helpful, interesting, thankyou)</li>
 *   <li>Community suggestions for content improvements (corrections, additions, feedback)</li>
 *   <li>Rate limiting and spam protection</li>
 *   <li>Aggregated reaction counts for public display</li>
 * </ul>
 *
 * <p><strong>Module Boundaries:</strong>
 * <ul>
 *   <li>Depends on: shared (domain models, events, exceptions)</li>
 *   <li>Exposes: ReactionController, SuggestionController, DTOs (public API)</li>
 *   <li>Internal: ReactionService, SuggestionService, repositories (package-private)</li>
 * </ul>
 *
 * <p><strong>Security:</strong>
 * <ul>
 *   <li>Reactions: Requires JWT authentication (user_id from token)</li>
 *   <li>Suggestions: Public endpoint with IP-based rate limiting</li>
 *   <li>Honeypot spam protection for suggestions</li>
 * </ul>
 *
 * <p><strong>Rate Limiting:</strong>
 * <ul>
 *   <li>Reactions: 10 per minute per authenticated user</li>
 *   <li>Suggestions: 5 per hour per IP address</li>
 * </ul>
 *
 * @since 1.0
 */
@PackageInfo
@ApplicationModule(
    displayName = "Content Actions Module",
    allowedDependencies = ["shared :: api", "shared :: domain", "shared :: events", "shared :: exception"],
    type = ApplicationModule.Type.OPEN,
)
class ContentActionsModuleMetadata
