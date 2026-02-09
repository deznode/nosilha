---
paths: apps/api/**
---

# Spring Modulith Architecture

## Commands

```bash
cd apps/api
./gradlew bootRun                    # Start development server
./gradlew build                      # Build JAR
./gradlew test                       # Run tests
./gradlew ktlintCheck                # Run Kotlin style checking
./gradlew test jacocoTestReport      # Run tests with coverage reports
./gradlew bootBuildImage             # Build Docker image
```

## Module Boundaries

Modular monolith with enforced boundaries. Modules communicate via events, not direct service calls.

```
apps/api/src/main/kotlin/com/nosilha/core/
├── shared/          # Shared kernel (events, exceptions, base classes, API wrappers)
├── auth/            # Authentication (JWT, Supabase, user profiles)
├── places/          # Directory entries (Restaurant, Hotel, Beach, Heritage, Nature)
├── gallery/         # Gallery media (user uploads + curated external content)
├── ai/              # AI image analysis and content moderation
├── engagement/      # User interactions (reactions, bookmarks)
├── stories/         # Community narratives, MDX publishing
├── feedback/        # Community feedback channels, dashboard
└── config/          # Cache configuration (Caffeine)
```

## Shared Module Structure

The `shared/` module is the shared kernel — other modules may depend on it:

```
shared/
├── api/             # ApiResult, PagedApiResult, ErrorResponse, shared DTOs
├── domain/          # AuditableEntity base class
├── events/          # DomainEvent, ApplicationModuleEvent interfaces
├── exception/       # ResourceNotFoundException, GlobalExceptionHandler
├── config/          # Cross-cutting config
├── service/         # Shared services
└── util/            # Utility functions
```

## Event-Driven Communication

### DomainEvent Interface

```kotlin
// shared/events/DomainEvent.kt
interface DomainEvent {
    val occurredAt: Instant
        get() = Instant.now()
}

// shared/events/ApplicationModuleEvent.kt
interface ApplicationModuleEvent : DomainEvent
```

### Publishing Events

```kotlin
@Service
class DirectoryEntryService(
    private val eventPublisher: ApplicationEventPublisher,
) {
    fun createEntry(request: CreateEntryRequestDto): DirectoryEntryDto {
        val saved = repository.save(entity)
        eventPublisher.publishEvent(
            DirectoryEntryCreatedEvent(saved.id!!, saved.category, saved.name)
        )
        return saved.toDto()
    }
}
```

### Consuming Events

```kotlin
@Service
class MediaService {
    @ApplicationModuleListener
    fun onDirectoryEntryCreated(event: DirectoryEntryCreatedEvent) {
        // Cross-module reaction — runs AFTER publishing transaction commits
        logger.info { "Directory entry created: ${event.entryId}" }
    }
}
```

### Event Data Classes

Events are immutable data classes named in past tense:

```kotlin
data class DirectoryEntryCreatedEvent(
    val entryId: UUID,
    val category: String,
    val name: String,
    override val occurredAt: Instant = Instant.now(),
) : ApplicationModuleEvent
```

## Architecture Rules

- Prefer cross-module communication via `ApplicationModuleEvent` events over direct dependencies
- Modules may depend on `shared/` freely; direct cross-module imports are acceptable for aggregation use cases (e.g., `auth.ProfileService` reads from engagement/feedback/stories)
- Each module owns its own database tables
- API versioning: all endpoints prefixed with `/api/v1/`
- Single Table Inheritance for `DirectoryEntry` subclasses

## Reference

- See `docs/architecture.md` for detailed technical architecture
- See `docs/spring-modulith.md` for complete module architecture guide
- See `docs/api-coding-standards.md` for coding standards
