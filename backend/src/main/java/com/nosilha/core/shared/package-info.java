/**
 * Shared Kernel Module
 *
 * <p>This module provides common infrastructure and base types used across all other modules.
 * It serves as the foundation layer with no dependencies on other modules.</p>
 *
 * <p><strong>Responsibilities:</strong></p>
 * <ul>
 *   <li>Base entity classes (AuditableEntity)</li>
 *   <li>Base event interfaces (DomainEvent, ApplicationModuleEvent)</li>
 *   <li>Common utilities (DateTimeUtils, ValidationUtils)</li>
 * </ul>
 *
 * <p><strong>Dependencies:</strong> None (foundation layer)</p>
 *
 * <p><strong>Module API:</strong> All classes in this module are public and available to other modules.</p>
 */
@org.springframework.modulith.ApplicationModule(
    displayName = "Shared Kernel"
)
package com.nosilha.core.shared;
