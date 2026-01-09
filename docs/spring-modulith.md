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

The Nos Ilha backend is organized into **8 modules**:

```
apps/api/src/main/kotlin/com/nosilha/core/
├── shared/           # Shared Kernel (foundation layer)
├── auth/             # Authentication Module
├── places/           # Places Module (restaurants, hotels, beaches, heritage, nature)
├── gallery/          # Gallery Module (user uploads + curated external content)
├── engagement/       # User Engagement Module (reactions, bookmarks)
├── stories/          # Community Stories Module
├── feedback/         # Community Feedback Module (suggestions, submissions, dashboard)
└── config/           # Cache Configuration Module
```

### Module Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Module Dependencies                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │           Shared Kernel (com.nosilha.core.shared)              │   │
│  │  • AuditableEntity                                             │   │
│  │  • DomainEvent, ApplicationModuleEvent                         │   │
│  │  • Common utilities                                            │   │
│  │  Dependencies: NONE                                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│        ┌───────────────────────────┼───────────────────────────┐        │
│        │                           │                           │        │
│        ▼                           ▼                           ▼        │
│  ┌─────────────┐           ┌──────────────┐           ┌──────────────┐ │
│  │Auth Module  │           │Places Module │           │Gallery Module│ │
│  │• JWT        │           │• DirectoryEntry│         │• User uploads│ │
│  │• UserProfile│           │• Restaurant  │           │• Curated ext │ │
│  │  Query      │           │• Hotel,Beach │           │  content     │ │
│  │Depends:     │           │Depends:      │           │Depends:      │ │
│  │  shared     │           │  shared      │           │  shared      │ │
│  └─────────────┘           └──────┬───────┘           └──────────────┘ │
│                                   │                                    │
│        ┌──────────────────────────┼──────────────────────────┐         │
│        │                          │                          │         │
│        ▼                          ▼                          ▼         │
│  ┌─────────────┐           ┌──────────────┐           ┌──────────────┐ │
│  │Engagement   │           │Stories       │           │Config Module │ │
│  │Module       │           │Module        │           │• CacheConfig │ │
│  │• Content    │           │• Story       │           │Dependencies: │ │
│  │• Reaction   │           │• MdxArchive  │           │  NONE        │ │
│  │• Bookmark   │           │• StoriesQuery│           └──────────────┘ │
│  │Depends:     │           │Depends:      │                            │
│  │  shared,    │           │  shared,     │                            │
│  │  places     │           │  auth,       │                            │
│  └─────────────┘           │  places      │                            │
│                            └──────┬───────┘                            │
│                                   │                                    │
│                                   ▼                                    │
│                            ┌──────────────┐                            │
│                            │Feedback      │                            │
│                            │Module        │                            │
│                            │• Suggestion  │                            │
│                            │• DirSubmission│                           │
│                            │• Contact     │                            │
│                            │• Dashboard   │                            │
│                            │Depends:      │                            │
│                            │  shared,     │                            │
│                            │  auth,       │                            │
│                            │  places,     │                            │
│                            │  stories,    │                            │
│                            │  gallery     │                            │
│                            └──────────────┘                            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Module Structure

### 1. Shared Kernel Module

**Package**: `com.nosilha.core.shared`
**Purpose**: Foundation layer providing common infrastructure for all modules

**Module Detection**: Spring Modulith auto-detects this module by directory structure (no module-level `PackageInfo.kt` required)

**Structure:**
```
shared/
├── domain/
│   ├── PackageInfo.kt    # @PackageInfo + @NamedInterface("domain") for public API
│   └── AuditableEntity.kt # Base entity with createdAt, updatedAt
├── events/
│   ├── PackageInfo.kt    # @PackageInfo + @NamedInterface("events") for public API
│   ├── DomainEvent.kt    # Base interface for all domain events
│   └── ApplicationModuleEvent.kt  # Base for module events
├── api/
│   └── PackageInfo.kt    # @PackageInfo + @NamedInterface("api") for public API
├── config/
│   └── PackageInfo.kt    # @PackageInfo for configuration
└── exception/
    └── PackageInfo.kt    # @PackageInfo for exception handling
```

**Named Interface Pattern:**
```kotlin
// shared/domain/PackageInfo.kt
@PackageInfo
@NamedInterface("domain")
class PackageInfo
// Allows other modules to reference as: "shared :: domain"
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

**Module Detection**: Spring Modulith auto-detects this module by directory structure

**Structure:**
```
auth/
├── api/
│   └── AuthController.kt  # Public REST endpoints (login, logout)
├── security/
│   ├── JwtAuthenticationFilter.kt  # JWT validation filter
│   └── SecurityConfig.kt           # Spring Security configuration
├── domain/
│   ├── JwtAuthenticationService.kt # Auth business logic (internal)
│   └── UserService.kt              # User management (internal)
└── events/
    ├── PackageInfo.kt         # @PackageInfo for public event API
    ├── UserLoggedInEvent.kt   # Published on successful login
    └── UserLoggedOutEvent.kt  # Published on logout
```

**Public API:**
- `AuthController` (REST endpoints)
- `UserLoggedInEvent`, `UserLoggedOutEvent` (domain events)

**Dependencies**: `shared`

### 3. Places Module

**Package**: `com.nosilha.core.places`
**Purpose**: Manage cultural heritage directory entries (restaurants, hotels, beaches, heritage sites, nature)

**Module Detection**: Spring Modulith auto-detects this module by directory structure

**Structure:**
```
places/
├── api/
│   └── DirectoryEntryController.kt  # Public REST endpoints (/api/v1/directory/*)
├── domain/
│   ├── DirectoryEntry.kt    # Base entity (Single Table Inheritance) - internal
│   ├── Restaurant.kt        # Restaurant-specific fields - internal
│   ├── Hotel.kt             # Hotel-specific fields - internal
│   ├── Heritage.kt          # Heritage site-specific fields - internal
│   ├── Beach.kt             # Beach-specific fields - internal
│   ├── Nature.kt            # Nature site-specific fields - internal
│   └── DirectoryEntryService.kt  # Business logic, event publishing - internal
├── repository/
│   └── DirectoryEntryRepository.kt  # JPA data access - internal
└── events/
    ├── DirectoryEntryCreatedEvent.kt  # Published on entry creation
    ├── DirectoryEntryUpdatedEvent.kt  # Published on entry update
    └── DirectoryEntryDeletedEvent.kt  # Published on entry deletion
```

**Public API:**
- `DirectoryEntryController` (REST endpoints)
- `DirectoryEntry*Event` (domain events)

**Dependencies**: `shared`, `engagement`

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

### 4. Gallery Module

**Package**: `com.nosilha.core.gallery`
**Purpose**: Unified media management for user-uploaded and admin-curated external content

**Module Detection**: Spring Modulith auto-detects this module by directory structure

**Structure:**
```
gallery/
├── api/
│   ├── GalleryController.kt       # Public REST endpoints (user uploads)
│   └── AdminGalleryController.kt  # Admin REST endpoints (curated content management)
├── domain/
│   ├── GalleryService.kt          # Business logic for all media - internal
│   ├── GalleryMedia.kt            # Base entity (Single Table Inheritance) - internal
│   ├── UserUpload.kt              # User-uploaded media - internal
│   └── ExternalMedia.kt           # Admin-curated external content - internal
├── repository/
│   └── GalleryMediaRepository.kt  # JPA data access - internal
└── events/
    └── MediaUploadedEvent.kt      # Published after file upload
```

**Event Listener Example:**
```kotlin
@Service
class GalleryService {
    @ApplicationModuleListener
    fun onDirectoryEntryCreated(event: DirectoryEntryCreatedEvent) {
        // React to directory entry creation
        // Create placeholder media metadata
        logger.info("Creating placeholder metadata for entry: ${event.name}")
    }
}
```

**Public API:**
- `GalleryController`, `AdminGalleryController` (REST endpoints)
- `MediaUploadedEvent` (domain events)

**Dependencies**: `shared`

**Storage Strategy:**
- **User Uploads**: Cloudflare R2 (S3-compatible) with presigned PUT URLs
- **External Media**: Platform-hosted content with metadata references (YouTube, Vimeo, etc.)
- **Metadata**: PostgreSQL via JPA with Single Table Inheritance

### 5. Engagement Module

**Package**: `com.nosilha.core.engagement`
**Purpose**: Manage user interactions with published content (reactions, bookmarks)

**Module Detection**: Spring Modulith auto-detects this module by directory structure

**Structure:**
```
engagement/
├── api/
│   ├── ReactionController.kt   # Public REST endpoints (reactions)
│   ├── BookmarkController.kt   # Public REST endpoints (bookmarks)
│   └── ContentController.kt    # Public REST endpoints (content registration)
├── domain/
│   ├── ReactionService.kt    # Business logic for reactions - internal
│   ├── BookmarkService.kt    # Business logic for bookmarks - internal
│   ├── ContentService.kt     # Business logic for content registration - internal
│   ├── Reaction.kt           # Reaction entity - internal
│   ├── Bookmark.kt           # Bookmark entity - internal
│   └── Content.kt            # Content entity - internal
├── repository/
│   ├── ReactionRepository.kt   # JPA data access - internal
│   ├── BookmarkRepository.kt   # JPA data access - internal
│   └── ContentRepository.kt    # JPA data access - internal
└── events/
    ├── ReactionCreatedEvent.kt  # Published when user reacts to content
    └── BookmarkCreatedEvent.kt  # Published when user bookmarks content
```

**Public API:**
- `ReactionController`, `BookmarkController`, `ContentController` (REST endpoints)
- `ReactionCreatedEvent`, `BookmarkCreatedEvent` (domain events)

**Dependencies**: `shared`, `places`

### 6. Stories Module

**Package**: `com.nosilha.core.stories`
**Purpose**: Manage community-submitted cultural heritage narratives and MDX publishing

**Module Detection**: Spring Modulith auto-detects this module by directory structure

**Structure:**
```
stories/
├── api/
│   └── StoryController.kt  # Public REST endpoints (story submissions, moderation)
├── domain/
│   ├── StoryService.kt         # Business logic for stories - internal
│   ├── MdxArchivalService.kt   # MDX generation and archival - internal
│   ├── Story.kt                # Story entity - internal
│   └── MdxArchive.kt           # MDX archive entity - internal
├── repository/
│   ├── StoryRepository.kt      # JPA data access - internal
│   └── MdxArchiveRepository.kt # JPA data access - internal
├── events/
│   ├── StorySubmittedEvent.kt  # Published when story is submitted
│   └── StoryPublishedEvent.kt  # Published when story is published
└── query/
    └── StoriesQueryService.kt  # Read-only query interface for cross-module access
```

**Public API:**
- `StoryController` (REST endpoints)
- `StorySubmittedEvent`, `StoryPublishedEvent` (domain events)
- `StoriesQueryService` (read-only query interface for dashboard and other modules)

**Dependencies**: `shared`, `auth`, `places`

**Query Service Pattern:**
```kotlin
// stories/query/StoriesQueryService.kt
interface StoriesQueryService {
    fun getStoryCount(): Long
    fun getRecentStories(limit: Int): List<StoryDto>
    fun getStoryStats(): StoryStatsDto
}
```

### 7. Feedback Module

**Package**: `com.nosilha.core.feedback`
**Purpose**: Manage community feedback channels (suggestions, directory submissions, contact messages) and admin dashboard

**Module Detection**: Spring Modulith auto-detects this module by directory structure

**Structure:**
```
feedback/
├── api/
│   ├── SuggestionController.kt             # Public REST endpoints (suggestions)
│   ├── DirectorySubmissionController.kt    # Public REST endpoints (directory submissions)
│   ├── ContactMessageController.kt         # Public REST endpoints (contact messages)
│   └── DashboardController.kt              # Public REST endpoints (admin dashboard)
├── domain/
│   ├── SuggestionService.kt            # Business logic for suggestions - internal
│   ├── DirectorySubmissionService.kt   # Business logic for directory submissions - internal
│   ├── ContactMessageService.kt        # Business logic for contact messages - internal
│   ├── DashboardService.kt             # Aggregate stats service - internal
│   ├── Suggestion.kt                   # Suggestion entity - internal
│   ├── DirectorySubmission.kt          # Directory submission entity - internal
│   └── ContactMessage.kt               # Contact message entity - internal
├── repository/
│   ├── SuggestionRepository.kt             # JPA data access - internal
│   ├── DirectorySubmissionRepository.kt    # JPA data access - internal
│   └── ContactMessageRepository.kt         # JPA data access - internal
└── events/
    ├── SuggestionCreatedEvent.kt           # Published when suggestion is created
    └── DirectorySubmissionCreatedEvent.kt  # Published when directory submission is created
```

**Public API:**
- `SuggestionController`, `DirectorySubmissionController`, `ContactMessageController`, `DashboardController` (REST endpoints)
- `SuggestionCreatedEvent`, `DirectorySubmissionCreatedEvent` (domain events)

**Dependencies**: `shared`, `auth`, `places`, `stories`, `engagement`, `gallery`

**Cross-Module Query Pattern:**
```kotlin
// feedback/domain/DashboardService.kt
@Service
class DashboardService(
    private val storiesQueryService: StoriesQueryService,  // From stories module
    private val galleryQueryService: GalleryQueryService,  // From gallery module
    private val suggestionRepository: SuggestionRepository
) {
    fun getAggregateStats(): DashboardStatsDto {
        return DashboardStatsDto(
            storyCount = storiesQueryService.getStoryCount(),
            mediaCount = galleryQueryService.getMediaCount(),
            suggestionCount = suggestionRepository.count()
        )
    }
}
```

### 8. Config Module

**Package**: `com.nosilha.core.config`
**Purpose**: Application-wide configuration for caching and cross-cutting concerns

**Module Detection**: Spring Modulith auto-detects this module by directory structure

**Structure:**
```
config/
└── CacheConfig.kt  # Caffeine cache configuration
```

**Key Configuration:**
```kotlin
@Configuration
@EnableCaching
class CacheConfig {
    @Bean
    fun cacheManager(): CacheManager {
        return CaffeineCacheManager().apply {
            setCaffeine(
                Caffeine.newBuilder()
                    .maximumSize(500)
                    .expireAfterWrite(Duration.ofMinutes(10))
            )
        }
    }
}
```

**Dependencies**: None (infrastructure layer)

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
// places/events/DirectoryEntryCreatedEvent.kt
data class DirectoryEntryCreatedEvent(
    val entryId: UUID,
    val name: String,
    val occurredAt: Instant = Instant.now()
) : ApplicationModuleEvent
```

**2. Publish Event:**
```kotlin
// places/domain/DirectoryEntryService.kt
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
// gallery/domain/GalleryService.kt
@Service
class GalleryService {
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

### Query Service Pattern for Cross-Module Reads

While events handle write operations and side effects, modules expose **read-only query services** for cross-module data access. This maintains module boundaries while allowing safe data retrieval.

**Pattern:**
1. **Define Query Interface**: Module exposes a read-only interface in its public API
2. **Implement in Service**: Module implements the interface internally
3. **Inject via Constructor**: Other modules inject the query service

**Example: Stories Module Exposes Query Service**
```kotlin
// stories/query/StoriesQueryService.kt (public API)
interface StoriesQueryService {
    fun getStoryCount(): Long
    fun getRecentStories(limit: Int): List<StoryDto>
    fun getStoryStats(): StoryStatsDto
}

// stories/domain/StoryService.kt (internal implementation)
@Service
internal class StoryService(
    private val repository: StoryRepository
) : StoriesQueryService {
    override fun getStoryCount(): Long = repository.count()
    override fun getRecentStories(limit: Int): List<StoryDto> {
        return repository.findTopByOrderByCreatedAtDesc(limit)
            .map { it.toDto() }
    }
    // ... business logic methods
}
```

**Example: Feedback Module Consumes Query Service**
```kotlin
// feedback/domain/DashboardService.kt
@Service
class DashboardService(
    private val storiesQueryService: StoriesQueryService,  // Injected from stories module
    private val galleryQueryService: GalleryQueryService,  // Injected from gallery module
    private val suggestionRepository: SuggestionRepository
) {
    fun getAggregateStats(): DashboardStatsDto {
        return DashboardStatsDto(
            storyCount = storiesQueryService.getStoryCount(),
            mediaCount = galleryQueryService.getMediaCount(),
            suggestionCount = suggestionRepository.count()
        )
    }
}
```

**Query Services in the System:**
- `StoriesQueryService` - Stories module exposes query interface for dashboard
- `GalleryQueryService` - Gallery module exposes query interface for dashboard
- `PlacesQueryService` - Places module exposes query interface
- `UserProfileQueryService` - Auth module exposes query interface

**Benefits:**
- ✅ **Maintains Encapsulation**: Internal implementation details remain hidden
- ✅ **Type-Safe Contracts**: Query interfaces define clear contracts
- ✅ **Read-Only Guarantee**: Query services cannot mutate state
- ✅ **No Circular Dependencies**: Query services are one-way dependencies

---

## Module Boundaries & Rules

### Dependency Rules

1. ✅ **Modules can depend on `shared`**
2. ✅ **Modules communicate via events**
3. ❌ **Modules CANNOT import from other modules directly**
4. ❌ **NO circular dependencies**

### Package Visibility

**Module Detection**: Spring Modulith auto-detects modules by directory structure under `com.nosilha.core`

**Public API** (accessible from other modules):
- Controllers in `api/` packages (REST endpoints)
- Events in `events/` packages (domain events)
- Named interfaces declared with `@PackageInfo` + `@NamedInterface`

**Internal** (package-private, not accessible from other modules):
- Services in `domain/` packages (business logic)
- Repositories in `repository/` packages (data access)
- Domain entities in `domain/` packages
- Configuration in `config/` packages

### Verification

Spring Modulith automatically verifies:
- ✅ Module boundaries are respected
- ✅ No circular dependencies
- ✅ Only public API is accessed from outside

---

## Verification Testing

### ModularityTests

**Location**: `apps/api/src/test/kotlin/com/nosilha/core/ModularityTests.kt`

```kotlin
class ModularityTests {
    private val modules = ApplicationModules.of("com.nosilha.core")

    @Test
    fun `verify module structure`() {
        modules.verify()
    }

    @Test
    fun `places module should only depend on shared`() {
        modules.getModuleByName("places")
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
    path: apps/api/build/modulith/
```

---

## Adding New Modules

### Step 1: Create Module Structure

Spring Modulith automatically detects modules by directory structure under `com.nosilha.core`. Simply create a new package directory:

```bash
mkdir -p src/main/kotlin/com/nosilha/core/newmodule/{api,domain,repository,events}
```

### Step 2: Implement Domain Logic

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

**Optional: Named Interfaces** (for advanced API granularity)
```kotlin
// newmodule/domain/PackageInfo.kt
@PackageInfo
@NamedInterface("domain")
class PackageInfo
// Allows other modules to selectively reference: "newmodule :: domain"
```

### Step 3: Add Verification Tests

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

### Step 4: Generate Documentation

```bash
./gradlew test --tests "ModularityTests"
```

---

## Best Practices

### 1. Keep Modules Small and Focused

```
✅ Good: Each module has a single responsibility
  - auth: Authentication only
  - places: Places management only
  - gallery: Media processing only

❌ Bad: Modules with multiple unrelated responsibilities
  - core: Everything (auth + places + gallery + ...)
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
    modules.getModuleByName("places")
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
Module 'places' depends on 'gallery' but this is not allowed
```

**Solution**: Use events instead of direct dependencies
```kotlin
// Before:
class DirectoryEntryService(private val galleryService: GalleryService)

// After:
class DirectoryEntryService(private val eventPublisher: ApplicationEventPublisher)
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
- [`architecture.md`](architecture.md) - System architecture with module structure
- [`api-coding-standards.md`](api-coding-standards.md) - Backend coding standards
- [`testing.md`](testing.md) - Testing module boundaries
- [`CLAUDE.md`](../CLAUDE.md) - Main development guide
