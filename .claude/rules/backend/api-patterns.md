---
paths: apps/api/**
---

# Backend API Patterns

## API Integration

- Frontend uses `/lib/api.ts` for backend communication
- All API calls handle errors gracefully with proper types
- Backend endpoints follow RESTful conventions with proper HTTP status codes
- See `docs/api-coding-standards.md` for comprehensive standards

## Authentication & Security Flow

```
Login:
Frontend (login-form.tsx) → Supabase Auth → JWT Token → AuthProvider (auth-provider.tsx)

API Requests:
Frontend → api.ts → JWT Header → Backend API → JwtAuthenticationFilter → Validate & Authorize

Protected Routes:
proxy.ts → Check Auth State → Allow/Redirect
```

## Database Access

- Use JPA repositories for database operations
- All entities extend proper base classes and use UUID primary keys
- Flyway handles database migrations in `apps/api/src/main/resources/db/`
- Single Table Inheritance pattern for `DirectoryEntry` subclasses (`Restaurant`, `Hotel`, `Landmark`, `Beach`)

### Migration Location

```
apps/api/src/main/resources/db/migration/
├── V1__initial_schema.sql
├── V2__add_directory_entries.sql
└── ...
```

## Database Strategy

| Database | Purpose |
|----------|---------|
| **PostgreSQL** | Primary database for all structured data (directory entries, user accounts, media metadata) |

## Media Storage

- **Development**: Local filesystem storage (`./uploads` directory)
- **Production**: Cloud storage integration deferred
- **Metadata**: Stored in PostgreSQL `media` table with placeholder columns for future AI integration

## RESTful Conventions

```kotlin
@RestController
@RequestMapping("/api/v1/directory")
class DirectoryController {

    @GetMapping("/{id}")
    fun getEntry(@PathVariable id: UUID): ResponseEntity<DirectoryEntryDto>

    @PostMapping
    fun createEntry(@RequestBody dto: CreateDirectoryEntryDto): ResponseEntity<DirectoryEntryDto>

    @PutMapping("/{id}")
    fun updateEntry(@PathVariable id: UUID, @RequestBody dto: UpdateDirectoryEntryDto): ResponseEntity<DirectoryEntryDto>

    @DeleteMapping("/{id}")
    fun deleteEntry(@PathVariable id: UUID): ResponseEntity<Unit>
}
```

## Reference

- See `docs/api-coding-standards.md` for comprehensive backend coding standards
- See `docs/api-reference.md` for API documentation with endpoints and examples
