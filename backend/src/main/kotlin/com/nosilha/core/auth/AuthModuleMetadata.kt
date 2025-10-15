package com.nosilha.core.auth

import org.springframework.modulith.ApplicationModule

/**
 * Authentication Module Metadata
 *
 * <p>This marker class defines the Spring Modulith module metadata for the Authentication module.
 * In Kotlin projects, package-info.java is not supported, so we use this annotated marker class instead.
 *
 * <p><strong>Module: Authentication</strong>
 * <ul>
 *   <li>Display Name: Authentication Module</li>
 *   <li>Dependencies: shared :: events (for domain event base classes)</li>
 *   <li>Type: DEFAULT (strict encapsulation)</li>
 * </ul>
 *
 * <p><strong>Responsibilities:</strong>
 * <ul>
 *   <li>JWT authentication and token validation</li>
 *   <li>Security configuration and filters</li>
 *   <li>User authentication events</li>
 *   <li>Supabase integration for auth</li>
 * </ul>
 *
 * <p><strong>Module Boundaries:</strong>
 * <ul>
 *   <li>Depends on: shared (domain models, events)</li>
 *   <li>Exposes: SecurityConfig, JwtAuthenticationFilter (public API)</li>
 *   <li>Internal: Implementation details (package-private)</li>
 * </ul>
 *
 * @since 1.0
 */
@ApplicationModule(
    displayName = "Authentication Module",
    allowedDependencies = ["shared :: events"]
)
class AuthModuleMetadata
