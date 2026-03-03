---
name: managing-databases
description: PostgreSQL schema design with Single Table Inheritance, Flyway migrations, and performance optimization. Use when designing/creating database schemas, planning/writing migrations, optimizing/tuning queries, or user mentions 'database design', 'migration', 'schema change', 'slow query', or needs cultural heritage data modeling.
---

# Database Architecture Specialist

This skill should be used when working with PostgreSQL database architecture, schema design, performance optimization, Flyway migrations, or multi-database coordination for the Nos Ilha cultural heritage platform.

## When to Use This Skill

- User needs database schema design for new features or data models
- Flyway migration creation required for schema changes
- Performance optimization needed for slow queries or searches
- Geographic data modeling for Brava Island location-based queries
- Multi-database coordination between PostgreSQL and Firestore
- Full-text search implementation for heritage content discovery
- Index strategy planning for query optimization
- Database constraints needed for data integrity

## Core Capabilities

This skill specializes in:

- **PostgreSQL Schema Design**: Single Table Inheritance (STI) for DirectoryEntry hierarchy
- **Migration Management**: Flyway versioned migrations with rollback procedures
- **Performance Optimization**: Strategic indexes, query optimization, HikariCP connection pooling
- **Multi-Database Coordination**: PostgreSQL (structured data) + Firestore (AI metadata)
- **Geographic Modeling**: Brava Island coordinate queries with spatial indexing

## Mandatory Architecture Standards

### Single Table Inheritance Pattern

To maintain schema consistency:

1. **Use STI for DirectoryEntry Hierarchy**: All directory types (Restaurant, Hotel, Landmark, Beach) use single table with discriminator column
2. **Nullable Subtype Fields**: Subtype-specific fields implemented as nullable columns in base table
3. **Never Create Separate Tables**: STI pattern mandatory for all DirectoryEntry subtypes
4. **Reference API Coding Standards**: Always consult `docs/API_CODING_STANDARDS.md` for STI decision matrix

### Migration Standards

To ensure safe deployments:

1. **Sequential Versioning**: Use Flyway format `V{version}__{description}.sql` (e.g., `V023__add_heritage_discovery.sql`)
2. **Backward Compatibility**: New columns must be nullable, avoid breaking changes
3. **Zero-Downtime Operations**: Use `CREATE INDEX CONCURRENTLY`, avoid blocking operations
4. **Descriptive Names**: Migration filenames must communicate intent clearly
5. **Rollback Support**: Design migrations allowing rollback to previous versions

### Performance Standards

To maintain query speed:

1. **Query Response Target**: <100ms for heritage searches and location queries
2. **Index Utilization**: >95% for frequently executed queries
3. **Strategic Indexing**: Geographic (GIST), full-text (GIN), category filtering, composite indexes
4. **Connection Pooling**: Optimize HikariCP for Cloud Run serverless scaling

Reference `docs/API_CODING_STANDARDS.md` before all database changes.

## Database Design Workflows

### Schema Design Workflow

Follow this process for new database structures:

1. **Analyze Requirements**: Determine data model needs from feature specifications
2. **Choose Architecture**: Apply STI decision matrix from `docs/API_CODING_STANDARDS.md`
3. **Design Entity Structure**: Define fields, types, constraints, nullability
4. **Plan Relationships**: Specify foreign keys, cascades, referential integrity
5. **Identify Indexes**: Determine query patterns requiring optimization
6. **Validate Geography**: Ensure Brava Island coordinate constraints (lat: 14.80-14.90, lng: -24.75 to -24.65)

See [MIGRATION_PATTERNS.md](MIGRATION_PATTERNS.md) for Flyway migration examples.

### Migration Creation Workflow

Follow this process for schema changes:

1. **Review Existing Patterns**: Check `backend/src/main/resources/db/migration/` for consistency
2. **Design Backward-Compatible Changes**: Ensure rollback compatibility
3. **Create Migration File**: Use sequential numbering with descriptive name
4. **Implement Schema Changes**: Write SQL following zero-downtime patterns
5. **Add Performance Indexes**: Use `CREATE INDEX CONCURRENTLY` for non-blocking creation
6. **Test Rollback**: Verify migration can be safely rolled back

### Query Optimization Workflow

Follow this process for performance issues:

1. **Analyze Query**: Identify slow queries from database logs or performance monitoring
2. **Check Index Usage**: Verify existing indexes utilized with `EXPLAIN ANALYZE`
3. **Design Strategic Index**: Create composite, partial, or specialized indexes
4. **Implement Non-Blocking**: Use `CONCURRENTLY` for production deployments
5. **Monitor Performance**: Track query response time improvements
6. **Validate Results**: Ensure <100ms target achieved

See [PERFORMANCE_GUIDE.md](PERFORMANCE_GUIDE.md) for indexing strategies and optimization techniques.

## Key Technical Patterns

### Single Table Inheritance Example

```sql
-- DirectoryEntry base table with discriminator pattern
CREATE TABLE directory_entries (
  id UUID PRIMARY KEY,
  category VARCHAR(50) NOT NULL,  -- Discriminator column (Restaurant, Hotel, Landmark, Beach)
  name VARCHAR(255) NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) CHECK (latitude BETWEEN 14.80 AND 14.90),
  longitude DECIMAL(11, 8) CHECK (longitude BETWEEN -24.75 AND -24.65),

  -- Restaurant-specific (nullable for other types)
  cuisine_type VARCHAR(100),
  specialties TEXT[],

  -- Hotel-specific (nullable for other types)
  room_count INTEGER,
  amenities TEXT[],

  -- Landmark-specific (nullable for other types)
  historical_period VARCHAR(100),
  cultural_significance_rating INTEGER
);
```

### Flyway Migration Example

```sql
-- V023__add_cultural_significance.sql
-- Add cultural significance rating field (STI pattern - nullable for all subtypes)

ALTER TABLE directory_entries
ADD COLUMN cultural_significance_rating INTEGER
CHECK (cultural_significance_rating >= 1 AND cultural_significance_rating <= 10);

COMMENT ON COLUMN directory_entries.cultural_significance_rating
IS 'Community-assessed cultural significance rating (1-10 scale)';

-- Composite index for significance-based heritage queries
CREATE INDEX CONCURRENTLY idx_directory_entries_category_significance
ON directory_entries (category, cultural_significance_rating)
WHERE cultural_significance_rating IS NOT NULL;
```

### Performance Index Strategies

**Geographic Queries** (GIST spatial index):
```sql
CREATE INDEX CONCURRENTLY idx_directory_entries_location
ON directory_entries USING GIST (
  ST_Point(longitude, latitude)
) WHERE latitude BETWEEN 14.80 AND 14.90
  AND longitude BETWEEN -24.75 AND -24.65;
```

**Full-Text Search** (GIN index for Portuguese content):
```sql
CREATE INDEX CONCURRENTLY idx_directory_entries_search
ON directory_entries USING GIN (
  to_tsvector('portuguese', name || ' ' || COALESCE(description, ''))
);
```

**Category Filtering** (Composite index):
```sql
CREATE INDEX CONCURRENTLY idx_directory_entries_category_town
ON directory_entries (category, town)
WHERE category IS NOT NULL AND town IS NOT NULL;
```

## Multi-Database Coordination

### PostgreSQL + Firestore Integration

To coordinate structured and flexible data:

**PostgreSQL Usage**:
- Core directory entries with relational integrity
- User accounts and authentication data
- Structured heritage data requiring complex queries
- Geographic data with spatial relationships

**Firestore Usage**:
- AI-generated metadata from Cloud Vision API
- Image analysis results and cultural tags
- Flexible schema document-based data
- Real-time collaborative features

**Integration Pattern**:
- Use Spring Data JPA for PostgreSQL access
- Use Spring Data Firestore for document access
- Implement validation ensuring cultural content integrity across databases
- Optimize data access patterns to minimize cross-database queries

## Error Handling

### Migration Rollback Procedures

To protect data integrity:

1. **Automated Rollback**: Flyway automatically rolls back failed migrations
2. **Test First**: Validate migrations in development before production
3. **Backward Compatibility**: Design for rollback to previous application versions
4. **Validation**: Check migration syntax and logic before execution

### Data Integrity Protection

To prevent corruption:

1. **Database Constraints**: Implement CHECK, NOT NULL, UNIQUE at database level
2. **Geographic Validation**: Coordinate constraints for Brava Island bounds
3. **Transaction Management**: Proper boundaries preventing partial corruption
4. **Constraint Violations**: Database-level validation catching issues early

### Connection Resilience

To handle Cloud Run serverless environment:

1. **Retry Logic**: Exponential backoff for transient connection failures
2. **Connection Validation**: HikariCP validation queries detecting stale connections
3. **Pool Monitoring**: Track exhaustion and adjust configuration proactively

## Geographic Data Management

To support location-based features:

1. **Brava Island Bounds**: Validate all coordinates (lat: 14.80-14.90, lng: -24.75 to -24.65)
2. **PostGIS Functions**: Use spatial functions for proximity searches
3. **GIST Indexes**: Optimize location-based heritage discovery queries
4. **Spatial Relationships**: Support nearest landmark, within radius queries

## Documentation References

**Always consult before database changes**:

- `docs/API_CODING_STANDARDS.md` - Comprehensive database standards, STI patterns, entity validation, migration conventions
- `backend/src/main/resources/db/migration/` - Existing Flyway migration patterns for consistency
- `backend/src/main/kotlin/com/nosilha/core/domain/DirectoryEntry.kt` - STI entity structure and schema alignment

**Supporting Documentation**:

- [MIGRATION_PATTERNS.md](MIGRATION_PATTERNS.md) - Flyway examples with STI patterns
- [PERFORMANCE_GUIDE.md](PERFORMANCE_GUIDE.md) - Indexing strategies and query optimization

## Best Practices

**Remember these principles**:

1. **Reference Standards First**: Always consult `docs/API_CODING_STANDARDS.md` before database work
2. **Follow Existing Patterns**: Review existing migrations for consistency
3. **Zero-Downtime Deployments**: Use `CONCURRENTLY`, avoid blocking operations
4. **Data Integrity Priority**: Implement constraints at database level
5. **Performance Targets**: Maintain <100ms query response times
6. **Geographic Validation**: Enforce Brava Island coordinate constraints
7. **Backward Compatibility**: Design migrations allowing rollback
8. **Cultural Data Protection**: Implement validation preventing heritage content corruption

Every database change must preserve data integrity, maintain query performance, and support zero-downtime deployments for the cultural heritage platform.
