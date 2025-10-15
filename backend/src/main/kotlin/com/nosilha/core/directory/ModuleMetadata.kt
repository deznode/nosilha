package com.nosilha.core.directory

import org.springframework.modulith.ApplicationModule

/**
 * Directory Module Metadata
 *
 * <p>This marker class defines the Spring Modulith module metadata for the Directory module.
 * In Kotlin projects, package-info.java is not supported, so we use this annotated marker class instead.
 *
 * <p><strong>Module: Directory</strong>
 * <ul>
 *   <li>Display Name: Directory Module</li>
 *   <li>Dependencies: shared (Shared Kernel only)</li>
 *   <li>Type: DEFAULT (strict encapsulation)</li>
 * </ul>
 *
 * <p><strong>Responsibilities:</strong>
 * <ul>
 *   <li>Directory entry management (Restaurant, Hotel, Beach, Landmark)</li>
 *   <li>Single Table Inheritance pattern for DirectoryEntry entities</li>
 *   <li>RESTful API for directory operations (CRUD)</li>
 *   <li>Directory entry domain events</li>
 * </ul>
 *
 * <p><strong>Module Boundaries:</strong>
 * <ul>
 *   <li>Depends on: shared (domain models, events, DTOs)</li>
 *   <li>Exposes: DirectoryEntryController, DirectoryEntryDto (public API)</li>
 *   <li>Internal: DirectoryEntryService, repositories (package-private)</li>
 * </ul>
 *
 * <p><strong>Event Communication:</strong>
 * <ul>
 *   <li>Publishes: DirectoryEntryCreatedEvent, DirectoryEntryUpdatedEvent, DirectoryEntryDeletedEvent</li>
 *   <li>These events are consumed by other modules (e.g., media module for processing)</li>
 * </ul>
 *
 * @since 1.0
 */
@ApplicationModule(
    displayName = "Directory Module",
    allowedDependencies = ["shared"]
)
class DirectoryModuleMetadata
