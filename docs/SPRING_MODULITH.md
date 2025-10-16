# Spring Modulith Guide - Nos Ilha Backend

This document provides comprehensive guidance on the Spring Modulith modular architecture implemented in the Nos Ilha backend, covering module structure, event-driven communication, and verification testing.

## Table of Contents

1. [Spring Modulith Overview](#spring-modulith-overview)
2. [Module Architecture](#module-architecture)
3. [Module Structure](#module-structure)
4. [Event-Driven Communication](#event-driven-communication)
5. [Module Boundaries & Rules](#module-boundaries--rules)
6. [Verification Testing](#verification-testing)
7. [Adding New Modules](#adding-new-modules)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Spring Modulith Overview

### What is Spring Modulith?

Spring Modulith is a framework that helps structure Spring Boot applications as **modular monoliths** with:
- ✅ **Enforced Module Boundaries**: Prevents unwanted dependencies
- ✅ **Event-Driven Communication**: Modules communicate via application events
- ✅ **Automated Verification**: Tests enforce architectural rules
- ✅ **Auto-Generated Documentation**: PlantUML diagrams of module structure

### Why Modular Architecture?

**Problems with Monolithic Structure:**
- ❌ Tight coupling between components
- ❌ Difficult to understand boundaries
- ❌ Risky changes (everything can affect everything)
- ❌ Slow onboarding for new developers

**Benefits of Spring Modulith:**
- ✅ Clear module boundaries
- ✅ Independent module evolution
- ✅ Better testability
- ✅ Easier code navigation
- ✅ Reduced cognitive load

---

## Module Architecture

### Current Modules

The Nos Ilha backend is organized into **4 modules**:

```
backend/src/main/kotlin/com/nosilha/core/
├── shared/           # Shared Kernel (foundation layer)
├── auth/             # Authentication Module
├── directory/        # Directory Management Module
└── media/            # Media Processing Module
```

### Module Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                     Module Dependencies                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Shared Kernel (com.nosilha.core.shared)    │  │
│  │  • AuditableEntity                                   │  │
│  │  • DomainEvent, ApplicationModuleEvent               │  │
│  │  • Common utilities                                  │  │
│  │  Dependencies: NONE                                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                         ▲      ▲      ▲                     │
│                         │      │      │                     │
│          ┌──────────────┘      │      └──────────────┐      │
│          │                     │                     │      │
│  ┌───────┴─────┐      ┌────────┴──────┐      ┌──────┴──────┐  │
│  │Auth Module  │      │Directory      │      │Media Module │  │
│  │             │      │Module         │      │             │  │
│  │• Security   │      │• DirectoryEntry│     │• MediaService│  │
│  │• JWT        │      │• CRUD API      │     │• GCS, Vision │  │
│  │             │      │               │      │  API        │  │
│  │Depends:     │      │Depends:       │      │Depends:     │  │
│  │  shared     │      │  shared       │      │  shared     │  │
│  └─────────────┘      └───────┬───────┘      └──────▲──────┘  │
│                               │ Events              │         │
│                               └─────────────────────┘         │
│                       DirectoryEntryCreatedEvent              │
└─────────────────────────────────────────────────────────────┘
```

---

## Module Structure

### 1. Shared Kernel Module

**Package**: `com.nosilha.core.shared`
**Purpose**: Foundation layer providing common infrastructure for all modules

**Structure:**
```
shared/
├── PackageInfo.kt         # Module API declaration
├── domain/
│   ├── PackageInfo.kt    # Domain layer API
│   └── AuditableEntity.kt # Base entity with createdAt, updatedAt
├── events/
│   ├── PackageInfo.kt    # Events layer API
│   ├── DomainEvent.kt    # Base interface for all domain events
│   └── ApplicationModuleEvent.kt  # Base for module events
├── api/
│   └── PackageInfo.kt    # API layer declarations
└── exception/
    └── PackageInfo.kt    # Exception handling
```

**Key Files:**
```kotlin
// shared/domain/AuditableEntity.kt
@MappedSuperclass
abstract class AuditableEntity(
    @Column(name = "created_at")
    var createdAt: Instant? = null,

    @Column(name = "updated_at")
    var updatedAt: Instant? = null
) {
    @PrePersist
    fun prePersist() {
        createdAt = Instant.now()
        updatedAt = Instant.now()
    }

    @PreUpdate
    fun preUpdate() {
        updatedAt = Instant.now()
    }
}
```

**Dependencies**: NONE (foundation layer)

### 2. Auth Module

**Package**: `com.nosilha.core.auth`
**Purpose**: Authentication, authorization, and user management

**Structure:**
```
auth/
├── PackageInfo.kt         # Module API declaration
├── api/
│   └── AuthController.kt  # Public REST endpoints (login, logout)
├── security/
│   ├── JwtAuthenticationFilter.kt  # JWT validation filter
│   └── SecurityConfig.kt           # Spring Security configuration
├── domain/
│   ├── JwtAuthenticationService.kt # Auth business logic
│   └── UserService.kt              # User management
└── events/
    ├── UserLoggedInEvent.kt   # Published on successful login
    └── UserLoggedOutEvent.kt  # Published on logout
```

**Public API:**
- `AuthController` (REST endpoints)
- `UserLoggedInEvent`, `UserLoggedOutEvent` (domain events)

**Dependencies**: `shared`

### 3. Directory Module

**Package**: `com.nosilha.core.directory`
**Purpose**: Manage cultural heritage directory entries (restaurants, hotels, landmarks, beaches)

**Structure:**
```
directory/
├── PackageInfo.kt         # Module API declaration
├── api/
│   └── DirectoryController.kt  # Public REST endpoints (/api/v1/directory/*)
├── domain/
│   ├── DirectoryEntry.kt    # Base entity (Single Table Inheritance)
│   ├── Restaurant.kt        # Restaurant-specific fields
│   ├── Hotel.kt             # Hotel-specific fields
│   ├── Landmark.kt          # Landmark-specific fields
│   ├── Beach.kt             # Beach-specific fields
│   └── DirectoryService.kt  # Business logic, event publishing
├── repository/
│   └── DirectoryEntryRepository.kt  # JPA data access
└── events/
    ├── DirectoryEntryCreatedEvent.kt  # Published on entry creation
    ├── DirectoryEntryUpdatedEvent.kt  # Published on entry update
    └── DirectoryEntryDeletedEvent.kt  # Published on entry deletion
```

**Public API:**
- `DirectoryController` (REST endpoints)
- `DirectoryEntry*Event` (domain events)

**Dependencies**: `shared`

**Single Table Inheritance Pattern:**
```kotlin
@Entity
@Table(name = "directory_entries")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "entry_type", discriminatorType = DiscriminatorType.STRING)
abstract class DirectoryEntry(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(nullable = false)
    val name: String,

    @Column(nullable = false)
    val location: String,
) : AuditableEntity()

@Entity
@DiscriminatorValue("RESTAURANT")
class Restaurant(
    name: String,
    location: String,

    @Column(name = "cuisine_type")
    val cuisineType: String? = null,
) : DirectoryEntry(name = name, location = location)
```

### 4. Media Module

**Package**: `com.nosilha.core.media`
**Purpose**: Media asset management (images, videos) and AI processing

**Structure:**
```
media/
├── PackageInfo.kt         # Module API declaration
├── api/
│   └── MediaController.kt  # Public REST endpoints (file upload)
├── domain/
│   └── MediaService.kt     # GCS operations, AI processing, event listeners
├── repository/
│   └── FirestoreMediaRepository.kt  # Metadata storage
└── events/
    ├── MediaUploadedEvent.kt    # Published after file upload
    └── MediaProcessedEvent.kt   # Published after AI processing
```

**Event Listener Example:**
```kotlin
@Service
class MediaService {
    @ApplicationModuleListener
    fun onDirectoryEntryCreated(event: DirectoryEntryCreatedEvent) {
        // React to directory entry creation
        // Create placeholder media metadata
        logger.info("Creating placeholder metadata for entry: ${event.name}")
    }
}
```

**Public API:**
- `MediaController` (REST endpoints)
- `Media*Event` (domain events)

**Dependencies**: `shared`

---

## Event-Driven Communication

### Why Event-Driven?

**Problem**: Direct module dependencies create tight coupling
```kotlin
// ❌ Bad: Direct dependency
class DirectoryService(
    private val mediaService: MediaService  // Tight coupling!
) {
    fun createEntry(entry: DirectoryEntry) {
        repository.save(entry)
        mediaService.createPlaceholder(entry.id)  // Direct call
    }
}
```

**Solution**: Event-driven communication decouples modules
```kotlin
// ✅ Good: Event-driven
class DirectoryService(
    private val eventPublisher: ApplicationEventPublisher
) {
    fun createEntry(entry: DirectoryEntry) {
        val saved = repository.save(entry)

        // Publish event (fire and forget)
        eventPublisher.publishEvent(
            DirectoryEntryCreatedEvent(saved.id!!, saved.name)
        )
    }
}
```

### Event Pattern

**1. Define Event:**
```kotlin
// directory/events/DirectoryEntryCreatedEvent.kt
data class DirectoryEntryCreatedEvent(
    val entryId: UUID,
    val name: String,
    val occurredAt: Instant = Instant.now()
) : ApplicationModuleEvent
```

**2. Publish Event:**
```kotlin
// directory/domain/DirectoryService.kt
@Service
class DirectoryService(
    private val repository: DirectoryEntryRepository,
    private val eventPublisher: ApplicationEventPublisher
) {
    fun createEntry(entry: DirectoryEntry): DirectoryEntry {
        val saved = repository.save(entry)

        eventPublisher.publishEvent(
            DirectoryEntryCreatedEvent(saved.id!!, saved.name)
        )

        return saved
    }
}
```

**3. Listen to Event:**
```kotlin
// media/domain/MediaService.kt
@Service
class MediaService {
    @ApplicationModuleListener
    fun onDirectoryEntryCreated(event: DirectoryEntryCreatedEvent) {
        logger.info("New directory entry: ${event.name}")
        // Create placeholder metadata, trigger AI processing, etc.
    }
}
```

### Event Execution Model

- **Synchronous**: Events execute in the same transaction by default
- **Asynchronous**: Use `@Async` for background processing
- **Transactional**: Event listeners can participate in transactions

---

## Module Boundaries & Rules

### Dependency Rules

1. ✅ **Modules can depend on `shared`**
2. ✅ **Modules communicate via events**
3. ❌ **Modules CANNOT import from other modules directly**
4. ❌ **NO circular dependencies**

### Package Visibility

**Public API** (declared in `package-info.java`):
- Controllers (REST endpoints)
- Events (domain events)

**Internal** (package-private):
- Services (business logic)
- Repositories (data access)
- Domain entities

### Verification

Spring Modulith automatically verifies:
- ✅ Module boundaries are respected
- ✅ No circular dependencies
- ✅ Only public API is accessed from outside

---

## Verification Testing

### ModularityTests

**Location**: `backend/src/test/kotlin/com/nosilha/core/ModularityTests.kt`

```kotlin
class ModularityTests {
    private val modules = ApplicationModules.of("com.nosilha.core")

    @Test
    fun `verify module structure`() {
        modules.verify()
    }

    @Test
    fun `directory module should only depend on shared`() {
        modules.getModuleByName("directory")
            .dependencies
            .forEach { dependency ->
                assertThat(dependency.name).isEqualTo("shared")
            }
    }

    @Test
    fun `generate module documentation`() {
        Documenter(modules)
            .writeModulesAsPlantUml()
            .writeIndividualModulesAsPlantUML()
    }
}
```

### Running Verification

```bash
# Run module verification tests
./gradlew test --tests "ModularityTests"

# View generated PlantUML diagrams
ls build/modulith/*.puml
```

### CI/CD Integration

**Location**: `.github/workflows/backend-ci.yml`

```yaml
- name: Run Spring Modulith verification
  run: |
    ./gradlew test --tests "com.nosilha.core.ModularityTests" --no-daemon

- name: Upload module diagrams
  uses: actions/upload-artifact@v4
  with:
    name: modulith-diagrams
    path: backend/build/modulith/
```

---

## Adding New Modules

### Step 1: Create Module Structure

```bash
mkdir -p src/main/kotlin/com/nosilha/core/newmodule/{api,domain,repository,events}
```

### Step 2: Define Package Info

```kotlin
// newmodule/PackageInfo.kt
@org.springframework.modulith.ApplicationModule(
    displayName = "New Module",
    allowedDependencies = ["shared"]
)
package com.nosilha.core.newmodule
```

### Step 3: Implement Domain Logic

```kotlin
// newmodule/domain/NewService.kt
@Service
class NewService(
    private val repository: NewRepository,
    private val eventPublisher: ApplicationEventPublisher
) {
    fun performAction() {
        // Business logic
        eventPublisher.publishEvent(NewEvent())
    }

    @ApplicationModuleListener
    fun onOtherEvent(event: OtherEvent) {
        // React to events from other modules
    }
}
```

### Step 4: Add Verification Tests

```kotlin
@Test
fun `new module should only depend on shared`() {
    modules.getModuleByName("newmodule")
        .dependencies
        .forEach { dependency ->
            assertThat(dependency.name).isEqualTo("shared")
        }
}
```

### Step 5: Generate Documentation

```bash
./gradlew test --tests "ModularityTests"
```

---

## Best Practices

### 1. Keep Modules Small and Focused

```
✅ Good: Each module has a single responsibility
  - auth: Authentication only
  - directory: Directory management only
  - media: Media processing only

❌ Bad: Modules with multiple unrelated responsibilities
  - core: Everything (auth + directory + media + ...)
```

### 2. Use Events for Cross-Module Communication

```kotlin
// ✅ Good: Event-driven
eventPublisher.publishEvent(EntryCreatedEvent(id))

// ❌ Bad: Direct dependency
otherModuleService.doSomething(id)
```

### 3. Make Services Package-Private

```kotlin
// ✅ Good: Package-private service
@Service
internal class DirectoryService { }

// ❌ Bad: Public service (breaks encapsulation)
@Service
class DirectoryService { }
```

### 4. Expose Only Public API

```kotlin
// ✅ Good: Public controller (API)
@RestController
class DirectoryController { }

// ✅ Good: Public event
data class DirectoryEntryCreatedEvent { }

// ❌ Bad: Public domain entity (implementation detail)
// Keep entities internal to the module
```

### 5. Test Module Boundaries

```kotlin
@Test
fun `verify module dependencies`() {
    modules.getModuleByName("directory")
        .dependencies
        .forEach { assertThat(it.name).isEqualTo("shared") }
}
```

---

## Troubleshooting

### Issue: Module Boundary Violation

**Symptom**: `ModularityTests` fails with dependency violation

**Example Error**:
```
Module 'directory' depends on 'media' but this is not allowed
```

**Solution**: Use events instead of direct dependencies
```kotlin
// Before:
class DirectoryService(private val mediaService: MediaService)

// After:
class DirectoryService(private val eventPublisher: ApplicationEventPublisher)
```

### Issue: Circular Dependency

**Symptom**: Spring fails to start with circular dependency error

**Solution**: Analyze module diagram and break the cycle using events

### Issue: Event Not Received

**Symptom**: `@ApplicationModuleListener` not triggering

**Solution**:
1. Verify event is being published
2. Check listener method signature matches event type
3. Ensure listener is in a Spring-managed bean

---

## Resources

- **Spring Modulith Documentation**: https://docs.spring.io/spring-modulith/reference/
- **Event-Driven Architecture**: https://spring.io/blog/2022/10/21/introducing-spring-modulith
- **PlantUML**: https://plantuml.com/

---

**Related Documentation**:
- [`ARCHITECTURE.md`](ARCHITECTURE.md) - System architecture with module structure
- [`API_CODING_STANDARDS.md`](API_CODING_STANDARDS.md) - Backend coding standards
- [`TESTING.md`](TESTING.md) - Testing module boundaries
- [`CLAUDE.md`](../CLAUDE.md) - Main development guide
