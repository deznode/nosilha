/**
 * Directory Module
 *
 * <p>This module manages the cultural heritage directory entries for Brava Island,
 * including restaurants, hotels, landmarks, and beaches. It uses Single Table Inheritance
 * (STI) pattern for the directory entry hierarchy.</p>
 *
 * <p><strong>Responsibilities:</strong></p>
 * <ul>
 *   <li>CRUD operations for directory entries (Restaurant, Hotel, Landmark, Beach)</li>
 *   <li>Directory entry search and filtering</li>
 *   <li>Slug generation and management</li>
 *   <li>Publishing directory lifecycle events for other modules</li>
 * </ul>
 *
 * <p><strong>Public API:</strong></p>
 * <ul>
 *   <li>{@code com.nosilha.core.directory.api.DirectoryController} - REST endpoints for directory operations</li>
 *   <li>{@code com.nosilha.core.directory.events.DirectoryEntryCreatedEvent} - Published when an entry is created</li>
 *   <li>{@code com.nosilha.core.directory.events.DirectoryEntryUpdatedEvent} - Published when an entry is updated</li>
 *   <li>{@code com.nosilha.core.directory.events.DirectoryEntryDeletedEvent} - Published when an entry is deleted</li>
 * </ul>
 *
 * <p><strong>Dependencies:</strong></p>
 * <ul>
 *   <li>{@code shared} - AuditableEntity, base events</li>
 * </ul>
 *
 * <p><strong>Events Published:</strong></p>
 * <ul>
 *   <li>DirectoryEntryCreatedEvent - When a new directory entry is created</li>
 *   <li>DirectoryEntryUpdatedEvent - When an existing entry is updated</li>
 *   <li>DirectoryEntryDeletedEvent - When an entry is deleted</li>
 * </ul>
 *
 * <p><strong>Domain Model (Single Table Inheritance):</strong></p>
 * <pre>
 * DirectoryEntry (abstract base)
 * ├── Restaurant (@DiscriminatorValue("RESTAURANT"))
 * ├── Hotel (@DiscriminatorValue("HOTEL"))
 * ├── Landmark (@DiscriminatorValue("LANDMARK"))
 * └── Beach (@DiscriminatorValue("BEACH"))
 * </pre>
 */
@org.springframework.modulith.ApplicationModule(
    displayName = "Directory Module",
    allowedDependencies = {"shared"}
)
package com.nosilha.core.directory;
