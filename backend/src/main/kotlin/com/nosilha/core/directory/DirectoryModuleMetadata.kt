package com.nosilha.core.directory

import org.springframework.modulith.ApplicationModule
import org.springframework.modulith.PackageInfo

/**
 * Directory Module
 *
 * <p>This module is responsible for managing directory entries (restaurants, hotels, beaches,
 * landmarks) for the Nos Ilha cultural heritage platform.
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
 *   <li>Depends on: shared (domain models, events, DTOs, exceptions)</li>
 *   <li>Exposes: DirectoryEntryController, DirectoryEntryDto (public API), events (named interface)</li>
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
@PackageInfo
@ApplicationModule(
    displayName = "Directory Module",
    allowedDependencies = ["shared :: api", "shared :: domain", "shared :: events", "shared :: exception"],
    type = ApplicationModule.Type.OPEN
)
class DirectoryModuleMetadata
