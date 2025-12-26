package com.nosilha.core.auth

import org.springframework.modulith.ApplicationModule

/**
 * Auth Module - User authentication, authorization, and profile management
 *
 * Dependencies:
 * - contentactions: Profile contributions view requires read-only cross-module queries
 *   from reactions, suggestions, and story repositories.
 */
@ApplicationModule(allowedDependencies = ["contentactions"])
class AuthModuleMetadata
