---
name: managing-databases
description: PostgreSQL schema design with Single Table Inheritance, Flyway migrations, and performance optimization. Use when designing/creating database schemas, planning/writing migrations, optimizing/tuning queries, or user mentions 'database design', 'migration', 'schema change', 'slow query', or needs cultural heritage data modeling.
---

# Database Architecture Specialist

Use when working with PostgreSQL schema design, Flyway migrations, performance optimization, or geographic data for the Nos Ilha cultural heritage platform.

## When to Use

- Database schema design for new features
- Flyway migration creation for schema changes
- Performance optimization for slow queries
- Geographic data modeling for Brava Island
- Full-text search for heritage content
- Index strategy planning

## Mandatory Standards

### Single Table Inheritance Pattern
All DirectoryEntry types (Restaurant, Hotel, Landmark, Beach) use STI:
1. Single table with discriminator column (`category`)
2. Subtype fields as nullable columns
3. Never create separate tables for subtypes
4. Reference `docs/API_CODING_STANDARDS.md` for decision matrix

### Migration Standards
1. **Naming**: `V{version}__{description}.sql` (e.g., `V023__add_heritage_discovery.sql`)
2. **Backward Compatibility**: New columns must be nullable
3. **Zero-Downtime**: Use `CREATE INDEX CONCURRENTLY`
4. **Rollback Support**: Design for safe rollback

### Performance Targets
- Query response: <100ms for heritage searches
- Index utilization: >95% for frequent queries
- Strategic indexes: Geographic (GIST), full-text (GIN), composite

## Workflows

### Schema Design
1. Analyze requirements from feature specs
2. Apply STI decision matrix from API_CODING_STANDARDS.md
3. Define fields, types, constraints, nullability
4. Plan relationships and indexes
5. Validate Brava Island coordinates (lat: 14.80-14.90, lng: -24.75 to -24.65)

### Create Migration
1. Review patterns in `backend/src/main/resources/db/migration/`
2. Design backward-compatible changes
3. Create file with sequential numbering
4. Use `CREATE INDEX CONCURRENTLY` for indexes
5. Test rollback capability

### Optimize Query
1. Identify slow queries from logs
2. Check index usage with `EXPLAIN ANALYZE`
3. Design strategic index
4. Implement non-blocking with `CONCURRENTLY`
5. Validate <100ms target achieved

## SQL Patterns

See [references/sql-examples.md](references/sql-examples.md) for:
- STI table structure example
- Flyway migration example
- Geographic, full-text, and composite index patterns

## Advanced Patterns

See [references/advanced-patterns.md](references/advanced-patterns.md) for:

- Error handling (rollback, data integrity, connection resilience)
- Geographic data management for Brava Island

## Documentation References

**Always consult before changes**:
- `docs/API_CODING_STANDARDS.md` - STI patterns, validation, conventions
- `backend/src/main/resources/db/migration/` - Existing migration patterns
- `backend/src/main/kotlin/com/nosilha/core/domain/DirectoryEntry.kt` - STI entity

## Best Practices

1. Reference API_CODING_STANDARDS.md first
2. Follow existing migration patterns
3. Use `CONCURRENTLY` for production indexes
4. Implement constraints at database level
5. Maintain <100ms query response times
6. Enforce Brava Island coordinate constraints
7. Design migrations for rollback
