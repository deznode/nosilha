package com.nosilha.core.shared

import org.springframework.modulith.ApplicationModule
import org.springframework.modulith.PackageInfo

/**
 * Shared Kernel Module
 *
 * <p>This module provides shared infrastructure, domain models, and API contracts
 * used across all other modules in the Nos Ilha cultural heritage platform.
 *
 * <p><strong>Responsibilities:</strong>
 * <ul>
 *   <li>Base domain models (AuditableEntity)</li>
 *   <li>Domain events and application module events</li>
 *   <li>Shared API contracts (DTOs, response wrappers, error responses)</li>
 *   <li>Common exceptions and error handling</li>
 *   <li>Utility classes used across modules</li>
 * </ul>
 *
 * <p><strong>Module Boundaries:</strong>
 * <ul>
 *   <li>Depends on: NONE (foundation layer)</li>
 *   <li>Exposes: api, domain, events, exception (public API for all modules)</li>
 *   <li>Internal: None (all packages are exposed)</li>
 * </ul>
 *
 * <p><strong>Design Philosophy:</strong>
 * <ul>
 *   <li>Keep the shared kernel minimal - only truly shared concepts belong here</li>
 *   <li>Avoid domain logic - this is for infrastructure only</li>
 *   <li>Changes to shared kernel affect all modules - proceed with caution</li>
 * </ul>
 *
 * @since 1.0
 */
@PackageInfo
@ApplicationModule(
    displayName = "Shared Kernel",
    allowedDependencies = [],
    type = ApplicationModule.Type.OPEN
)
class SharedModuleMetadata
