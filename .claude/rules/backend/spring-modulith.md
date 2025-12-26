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
./gradlew detekt                     # Run Kotlin code analysis
./gradlew test jacocoTestReport      # Run tests with coverage reports
./gradlew bootBuildImage             # Build Docker image
```

## Architecture Patterns

- **Spring Modulith Architecture**: Modular monolith with enforced module boundaries (`shared`, `auth`, `directory`, `media`)
- **Event-Driven Communication**: Modules communicate via `@ApplicationModuleListener` without direct dependencies
- **Single Table Inheritance**: `DirectoryEntry` is the base class for `Restaurant`, `Hotel`, `Landmark`, etc.
- **API Versioning**: All REST endpoints are prefixed with `/api/v1/`
- **Authentication**: JWT-based authentication with Supabase token validation
- **Database Strategy**: PostgreSQL primary with Flyway migrations, connection pooling via HikariCP

## Testing

```bash
cd apps/api && ./gradlew test         # All tests with PostgreSQL
./gradlew test jacocoTestReport      # With coverage
./gradlew detekt                     # Linting and static analysis
```

### Testing Tools

- **Testcontainers**: PostgreSQL integration testing
- **JaCoCo**: Code coverage reports
- **Detekt**: Kotlin static analysis

## Module Structure

```
apps/api/src/main/kotlin/com/nosilha/
├── shared/          # Common utilities and base classes
├── auth/            # Authentication module (JWT, Supabase)
├── directory/       # Directory entries (Restaurant, Hotel, etc.)
└── media/           # Media processing and storage
```

## Key Patterns

### Single Table Inheritance

```kotlin
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "entry_type")
abstract class DirectoryEntry : BaseEntity()

@Entity
@DiscriminatorValue("RESTAURANT")
class Restaurant : DirectoryEntry()
```

### Event-Driven Communication

```kotlin
@ApplicationModuleListener
fun onDirectoryEntryCreated(event: DirectoryEntryCreatedEvent) {
    // Handle cross-module communication
}
```

## Reference

- See `docs/ARCHITECTURE.md` for detailed technical architecture
- See `docs/SPRING_MODULITH.md` for complete module architecture guide
- See `docs/API_CODING_STANDARDS.md` for coding standards
