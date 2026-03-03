# ADR 0002: Spring Modulith for Modular Monolith Architecture

## Status

Accepted

## Date

2025-12-01

## Context

The Nos Ilha backend requires an architectural approach that balances development velocity, maintainability, and operational simplicity. As a solo-maintained, volunteer-supported open-source project, the architecture must minimize DevOps burden while providing clear boundaries for code organization and future extensibility.

### Project Constraints

- **Team Size**: Solo maintainer with limited time
- **Budget**: Volunteer-supported, cost-conscious infrastructure
- **Complexity**: Cultural heritage platform with multiple domains (directory entries, media, authentication, user engagement, stories, feedback)
- **Evolution**: Need for potential future extraction of modules if scale demands

### Technical Requirements

- Clear separation between business domains (auth, directory, media, curatedmedia, engagement, stories, feedback)
- Event-driven communication for loose coupling
- Enforceable module boundaries to prevent spaghetti dependencies
- Single deployable unit for operational simplicity
- Strong typing and compile-time safety (Kotlin)

## Decision

We adopt **Spring Modulith** to implement a modular monolith architecture for the Nos Ilha backend.

### Architecture Overview

```
apps/api/src/main/kotlin/com/nosilha/core/
├── shared/           # Shared Kernel - foundation layer (events, audit, exceptions)
├── auth/             # Authentication Module - JWT auth, user management
├── directory/        # Directory Module - cultural heritage entries (STI pattern)
├── media/            # Media Module - file storage, AI processing, MediaQueryService
├── curatedmedia/     # Curated Media Module - admin-curated external content
├── engagement/       # Engagement Module - user interactions (reactions, bookmarks)
├── stories/          # Stories Module - community narratives, MDX publishing, StoriesQueryService
└── feedback/         # Feedback Module - community feedback channels, dashboard
```

### Key Implementation Patterns

#### 1. Module Structure

Each module follows a consistent internal structure:

```
module/
├── api/              # REST controllers (public, exposed to other modules)
├── domain/           # Business entities and services (internal)
├── repository/       # JPA data access (internal)
└── events/           # Domain events (public, exposed to other modules)
```

#### 2. Event-Driven Communication

Modules communicate via Spring Application Events, not direct dependencies:

```kotlin
// Publisher (directory module)
@Service
class DirectoryService(
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

// Listener (media module)
@Service
class MediaService {
    @ApplicationModuleListener
    fun onDirectoryEntryCreated(event: DirectoryEntryCreatedEvent) {
        // Create placeholder media metadata
    }
}
```

#### 3. Enforced Module Boundaries

Module boundaries are verified automatically via ModularityTests:

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
}
```

#### 4. Single Table Inheritance

Directory entries use STI for polymorphic storage:

```kotlin
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "entry_type")
abstract class DirectoryEntry : AuditableEntity()

@Entity
@DiscriminatorValue("RESTAURANT")
class Restaurant : DirectoryEntry()

@Entity
@DiscriminatorValue("LANDMARK")
class Landmark : DirectoryEntry()
```

## Alternatives Considered

### 1. Traditional Monolith (No Boundaries)

**Description**: Standard layered architecture (controller/service/repository) without explicit module boundaries.

**Pros**:
- Simplest to start with
- No additional framework dependencies
- Familiar pattern for most developers

**Cons**:
- No enforcement of boundaries leads to spaghetti code over time
- Difficult to extract services later
- High cognitive load as codebase grows
- Cross-cutting dependencies hard to track

**Why Rejected**: As the codebase grows, lack of enforced boundaries leads to tightly coupled code that becomes increasingly difficult to maintain and refactor.

### 2. Microservices Architecture

**Description**: Deploy each domain as an independent service with separate databases and network communication.

**Pros**:
- Independent scaling per service
- Technology heterogeneity (different languages/frameworks per service)
- Fault isolation
- Independent deployment

**Cons**:
- Significant operational complexity (orchestration, service mesh, observability)
- Network latency and failure handling overhead
- Data consistency challenges (eventual consistency, sagas)
- Requires dedicated DevOps expertise
- Higher infrastructure costs (multiple Cloud Run services, service discovery)
- Overkill for current team size and traffic patterns

**Why Rejected**: The operational burden of microservices far exceeds the benefits for a solo-maintained project. The DevOps complexity (container orchestration, service mesh, distributed tracing, multiple deployments) would consume development time that should focus on features.

### 3. CQRS/Event Sourcing

**Description**: Separate read and write models with event log as source of truth.

**Pros**:
- Complete audit trail
- Temporal queries
- Scalable read models

**Cons**:
- Significant complexity increase
- Learning curve for event sourcing patterns
- Snapshot management overhead
- Overkill for current requirements

**Why Rejected**: The added complexity is not justified by current requirements. Can be adopted incrementally within modules if needed.

## Consequences

### Positive

1. **Reduced Operational Complexity**: Single deployable unit means one Cloud Run service, one container image, one deployment pipeline.

2. **Enforced Module Boundaries**: `ModularityTests` fail the build if modules violate dependency rules, preventing architectural drift.

3. **Event-Driven Decoupling**: Modules communicate via events, enabling loose coupling without network overhead.

4. **Clear Extraction Path**: If scale demands, modules can be extracted to microservices because they already communicate via events and have no direct dependencies.

5. **Shared Database with Clear Ownership**: Each module owns its tables, but transactions span modules when needed (no distributed transactions).

6. **Lower DevOps Burden**: Solo maintainer can focus on features instead of orchestrating multiple services.

7. **Auto-Generated Documentation**: PlantUML diagrams of module structure generated during build.

8. **Better Testability**: Modules can be tested in isolation with Spring Modulith test support.

### Negative

1. **Scaling Granularity**: Cannot scale individual modules independently (entire monolith scales together).

2. **Technology Lock-in**: All modules must use the same JVM/Kotlin/Spring stack.

3. **Memory Footprint**: Larger application footprint than individual microservices (mitigated by Cloud Run auto-scaling to zero).

4. **Deployment Coupling**: All modules deploy together (mitigated by strong test coverage and CI/CD gates).

### Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Developers bypass module boundaries | ModularityTests enforce boundaries in CI |
| Event handling becomes complex | Document event flows, use typed events |
| Single point of failure | Cloud Run auto-healing, health checks |
| Module extraction becomes difficult | Maintain event-driven communication |

## References

- [Spring Modulith Documentation](https://docs.spring.io/spring-modulith/reference/)
- [Project Module Architecture](../spring-modulith.md)
- [System Architecture](../architecture.md)
- [API Coding Standards](../api-coding-standards.md)

## Notes

This decision aligns with the project's core principle of "right-sizing" architecture to team capabilities. As a solo-maintained, volunteer-supported project, operational simplicity is paramount. Spring Modulith provides the structure of microservices (module boundaries, event-driven communication, independent evolution) without the operational burden (multiple deployments, service mesh, distributed tracing).

If the project grows to require independent scaling or technology heterogeneity, modules can be extracted to microservices because they already:
- Communicate via events (no direct method calls)
- Have no shared state beyond the database
- Have clearly defined public APIs (controllers and events)
