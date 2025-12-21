# Flyway Migration Patterns

This guide provides patterns and examples for creating Flyway migrations following Nos Ilha database standards.

## Migration File Naming Convention

**Format**: `V{version}__{description}.sql`

**Version Numbering**: Sequential integers (V001, V002, V003, ..., V023, ...)

**Description**: Lowercase with underscores, communicating intent

**Examples**:
- `V001__create_directory_entries.sql` - Initial table creation
- `V023__add_cultural_significance.sql` - Add new field
- `V024__add_heritage_search_indexes.sql` - Performance optimization
- `V025__add_media_metadata.sql` - Media storage support

## Single Table Inheritance (STI) Migration Patterns

### Pattern 1: Create Base STI Table

```sql
-- V001__create_directory_entries.sql
-- Create DirectoryEntry base table with STI pattern

CREATE TABLE directory_entries (
  -- Primary key and metadata
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Discriminator column (STI pattern)
  category VARCHAR(50) NOT NULL,  -- Restaurant, Hotel, Landmark, Beach

  -- Common fields for all directory types
  name VARCHAR(255) NOT NULL,
  description TEXT,
  town VARCHAR(100),

  -- Geographic data with Brava Island constraints
  latitude DECIMAL(10, 8)
    CHECK (latitude BETWEEN 14.80 AND 14.90),
  longitude DECIMAL(11, 8)
    CHECK (longitude BETWEEN -24.75 AND -24.65),

  -- Restaurant-specific fields (nullable for other types)
  cuisine_type VARCHAR(100),
  specialties TEXT[],
  price_range VARCHAR(20),

  -- Hotel-specific fields (nullable for other types)
  room_count INTEGER CHECK (room_count > 0),
  amenities TEXT[],
  nightly_rate_eur DECIMAL(10, 2),

  -- Landmark-specific fields (nullable for other types)
  historical_period VARCHAR(100),
  cultural_significance_rating INTEGER
    CHECK (cultural_significance_rating BETWEEN 1 AND 10),

  -- Beach-specific fields (nullable for other types)
  beach_type VARCHAR(50),  -- volcanic, sandy, rocky
  accessibility_level VARCHAR(50)  -- easy, moderate, difficult
);

-- Indexes for common query patterns
CREATE INDEX idx_directory_entries_category
  ON directory_entries(category);

CREATE INDEX idx_directory_entries_town
  ON directory_entries(town);

COMMENT ON TABLE directory_entries
  IS 'Single Table Inheritance for all directory entry types (Restaurant, Hotel, Landmark, Beach)';

COMMENT ON COLUMN directory_entries.category
  IS 'Discriminator column for STI pattern identifying entry type';
```

### Pattern 2: Add STI Subtype Field

```sql
-- V023__add_cultural_significance.sql
-- Add field to existing STI table (nullable for compatibility)

-- Add new field (nullable for backward compatibility)
ALTER TABLE directory_entries
ADD COLUMN cultural_significance_rating INTEGER
  CHECK (cultural_significance_rating BETWEEN 1 AND 10);

-- Add column comment documenting purpose
COMMENT ON COLUMN directory_entries.cultural_significance_rating
  IS 'Community-assessed cultural significance rating (1-10 scale)';

-- Create index for new query pattern
CREATE INDEX CONCURRENTLY idx_directory_entries_category_significance
  ON directory_entries (category, cultural_significance_rating)
  WHERE cultural_significance_rating IS NOT NULL;
```

**Key STI Principles**:
- All subtype fields must be nullable (backward compatibility)
- Use discriminator column (category) for type filtering
- Create partial indexes with WHERE clauses for efficiency
- Document subtype field purpose in comments

### Pattern 3: Modify STI Field

```sql
-- V024__extend_description_length.sql
-- Modify existing STI field (backward compatible)

-- Extend field length (safe operation)
ALTER TABLE directory_entries
ALTER COLUMN description TYPE TEXT;

-- Update comment if semantic meaning changed
COMMENT ON COLUMN directory_entries.description
  IS 'Detailed cultural heritage description (unlimited length)';
```

**Safe Modifications**:
- Extend field length (VARCHAR(100) → VARCHAR(255) or TEXT)
- Remove NOT NULL constraint (add nullability)
- Relax CHECK constraints (widen range)

**Unsafe Modifications** (avoid):
- Add NOT NULL to existing nullable field
- Reduce field length
- Tighten CHECK constraints
- Change data type incompatibly

## Performance Index Patterns

### Pattern 4: Geographic GIST Index

```sql
-- V025__add_location_index.sql
-- Geographic spatial index for Brava Island location queries

-- GIST spatial index with partial WHERE for Brava bounds
CREATE INDEX CONCURRENTLY idx_directory_entries_location
  ON directory_entries USING GIST (
    ST_Point(longitude, latitude)
  )
  WHERE latitude BETWEEN 14.80 AND 14.90
    AND longitude BETWEEN -24.75 AND -24.65;

COMMENT ON INDEX idx_directory_entries_location
  IS 'Geographic GIST index for Brava Island proximity searches';
```

**When to Use**:
- Location-based searches (nearest landmarks)
- Proximity queries (within X km radius)
- Spatial relationships (contains, intersects)

### Pattern 5: Full-Text Search GIN Index

```sql
-- V026__add_fulltext_search.sql
-- Full-text search index for Portuguese heritage content

-- GIN index for Portuguese text search
CREATE INDEX CONCURRENTLY idx_directory_entries_search
  ON directory_entries USING GIN (
    to_tsvector('portuguese', name || ' ' || COALESCE(description, ''))
  );

COMMENT ON INDEX idx_directory_entries_search
  IS 'Full-text search index for Portuguese name and description content';
```

**When to Use**:
- Text search functionality
- Cultural heritage content discovery
- Multi-field search queries
- Weighted search rankings

### Pattern 6: Composite Index

```sql
-- V027__add_composite_category_town_index.sql
-- Composite index for category + town filtering

-- Composite index for common query pattern
CREATE INDEX CONCURRENTLY idx_directory_entries_category_town
  ON directory_entries (category, town)
  WHERE category IS NOT NULL AND town IS NOT NULL;

COMMENT ON INDEX idx_directory_entries_category_town
  IS 'Composite index for filtering directory entries by category and town';
```

**When to Use**:
- Multi-column WHERE clauses
- Queries filtering on both columns
- ORDER BY on indexed columns
- Common query patterns identified from logs

### Pattern 7: Partial Index

```sql
-- V028__add_restaurant_cuisine_index.sql
-- Partial index for restaurant-specific queries

-- Partial index only for Restaurant category
CREATE INDEX CONCURRENTLY idx_restaurants_cuisine
  ON directory_entries (cuisine_type)
  WHERE category = 'Restaurant' AND cuisine_type IS NOT NULL;

COMMENT ON INDEX idx_restaurants_cuisine
  IS 'Partial index for restaurant cuisine filtering (Restaurant category only)';
```

**When to Use**:
- Subtype-specific queries (e.g., only Restaurants)
- Filtering on nullable fields with common NULL values
- Reducing index size and improving performance
- Query patterns specific to one discriminator value

## Zero-Downtime Deployment Patterns

### Pattern 8: CONCURRENTLY Index Creation

```sql
-- V029__add_heritage_category_index.sql
-- Non-blocking index creation for production

-- CONCURRENTLY prevents table locking during index build
CREATE INDEX CONCURRENTLY idx_directory_entries_heritage_category
  ON directory_entries (category, cultural_significance_rating)
  WHERE cultural_significance_rating >= 7;

-- Note: CONCURRENTLY takes longer but allows reads/writes during creation
```

**When to Use**: Always use `CONCURRENTLY` for production indexes

**Trade-offs**:
- Slower index creation time
- No table locking (zero downtime)
- Safe for production deployments

### Pattern 9: Add Nullable Column

```sql
-- V030__add_website_url.sql
-- Add new nullable column (zero downtime)

-- Nullable column addition is safe for zero downtime
ALTER TABLE directory_entries
ADD COLUMN website_url VARCHAR(500);

-- Validation constraint (optional, enforced going forward)
ALTER TABLE directory_entries
ADD CONSTRAINT check_website_url_format
  CHECK (website_url ~ '^https?://');

COMMENT ON COLUMN directory_entries.website_url
  IS 'Official website URL for directory entry';
```

**Safe Pattern**:
- New column is nullable
- Application handles NULL values
- Constraint validates new data only
- Backward compatible with old code

### Pattern 10: Multi-Phase Column Migration

For complex changes requiring data migration:

**Phase 1: Add New Column**
```sql
-- V031__add_new_rating_system_phase1.sql
-- Phase 1: Add new column

ALTER TABLE directory_entries
ADD COLUMN community_rating INTEGER
  CHECK (community_rating BETWEEN 1 AND 5);
```

**Phase 2: Migrate Data** (Application or separate migration)
```sql
-- V032__add_new_rating_system_phase2.sql
-- Phase 2: Migrate existing data

UPDATE directory_entries
SET community_rating = CASE
  WHEN cultural_significance_rating >= 9 THEN 5
  WHEN cultural_significance_rating >= 7 THEN 4
  WHEN cultural_significance_rating >= 5 THEN 3
  WHEN cultural_significance_rating >= 3 THEN 2
  ELSE 1
END
WHERE cultural_significance_rating IS NOT NULL;
```

**Phase 3: Remove Old Column** (Future migration after deployment verified)
```sql
-- V033__add_new_rating_system_phase3.sql
-- Phase 3: Remove old column (after new system verified)

ALTER TABLE directory_entries
DROP COLUMN cultural_significance_rating;
```

## Geographic Constraint Patterns

### Pattern 11: Brava Island Coordinate Constraints

```sql
-- V034__enforce_brava_island_bounds.sql
-- Database-level geographic validation

-- Add constraints ensuring all coordinates within Brava Island
ALTER TABLE directory_entries
ADD CONSTRAINT check_brava_latitude
  CHECK (latitude IS NULL OR (latitude BETWEEN 14.80 AND 14.90));

ALTER TABLE directory_entries
ADD CONSTRAINT check_brava_longitude
  CHECK (longitude IS NULL OR (longitude BETWEEN -24.75 AND -24.65));

COMMENT ON CONSTRAINT check_brava_latitude ON directory_entries
  IS 'Ensures latitude coordinates are within Brava Island bounds';

COMMENT ON CONSTRAINT check_brava_longitude ON directory_entries
  IS 'Ensures longitude coordinates are within Brava Island bounds';
```

## Data Integrity Patterns

### Pattern 12: Referential Integrity

```sql
-- V035__add_user_accounts.sql
-- Foreign key relationships

CREATE TABLE user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key to directory_entries
ALTER TABLE directory_entries
ADD COLUMN created_by_user_id UUID,
ADD CONSTRAINT fk_directory_entries_user
  FOREIGN KEY (created_by_user_id)
  REFERENCES user_accounts(id)
  ON DELETE SET NULL;  -- Preserve entries if user deleted

CREATE INDEX idx_directory_entries_user
  ON directory_entries(created_by_user_id);
```

### Pattern 13: Enum-Style Constraints

```sql
-- V036__add_entry_status.sql
-- Enum-style CHECK constraint

ALTER TABLE directory_entries
ADD COLUMN status VARCHAR(20) DEFAULT 'draft'
  CHECK (status IN ('draft', 'published', 'archived', 'pending_review'));

CREATE INDEX idx_directory_entries_status
  ON directory_entries(status)
  WHERE status = 'published';  -- Partial index for most common query
```

## Rollback Patterns

### Pattern 14: Rollback-Safe Migration

```sql
-- V037__add_operating_hours.sql
-- Rollback-safe column addition

-- Add new column (rollback: just drop column)
ALTER TABLE directory_entries
ADD COLUMN operating_hours JSONB;

-- Add index (rollback: drop index)
CREATE INDEX CONCURRENTLY idx_directory_entries_hours
  ON directory_entries USING GIN (operating_hours);

-- Rollback script (separate file: V037__add_operating_hours_rollback.sql)
-- ALTER TABLE directory_entries DROP COLUMN operating_hours;
-- DROP INDEX idx_directory_entries_hours;
```

## Migration Testing Checklist

Before production deployment:

- [ ] Migration tested in development environment
- [ ] Rollback procedure tested successfully
- [ ] No blocking operations (used CONCURRENTLY for indexes)
- [ ] New columns are nullable for backward compatibility
- [ ] Geographic coordinates validated within Brava bounds
- [ ] STI pattern maintained (no separate tables for subtypes)
- [ ] Indexes created for new query patterns
- [ ] Comments added documenting purpose
- [ ] Migration naming follows V{version}__{description}.sql pattern
- [ ] Constraints allow NULL or have sensible defaults
- [ ] Performance impact estimated and acceptable

## Common Migration Mistakes to Avoid

**Mistake 1: Creating Separate Tables for STI Subtypes**
```sql
-- ❌ WRONG: Violates STI pattern
CREATE TABLE restaurants (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  cuisine_type VARCHAR(100)
);
```

**Correct Approach**:
```sql
-- ✅ CORRECT: Add to existing STI table
ALTER TABLE directory_entries
ADD COLUMN cuisine_type VARCHAR(100);
```

**Mistake 2: Adding NOT NULL Without Default**
```sql
-- ❌ WRONG: Breaks existing data
ALTER TABLE directory_entries
ADD COLUMN required_field VARCHAR(100) NOT NULL;
```

**Correct Approach**:
```sql
-- ✅ CORRECT: Nullable or with default
ALTER TABLE directory_entries
ADD COLUMN required_field VARCHAR(100) DEFAULT 'default_value';

-- Or make nullable first, populate, then add NOT NULL later
ALTER TABLE directory_entries
ADD COLUMN required_field VARCHAR(100);
```

**Mistake 3: Blocking Index Creation**
```sql
-- ❌ WRONG: Locks table during index build
CREATE INDEX idx_directory_entries_name
  ON directory_entries(name);
```

**Correct Approach**:
```sql
-- ✅ CORRECT: Non-blocking index creation
CREATE INDEX CONCURRENTLY idx_directory_entries_name
  ON directory_entries(name);
```

**Mistake 4: No Geographic Validation**
```sql
-- ❌ WRONG: Allows invalid coordinates
ALTER TABLE directory_entries
ADD COLUMN latitude DECIMAL(10, 8);
```

**Correct Approach**:
```sql
-- ✅ CORRECT: Enforce Brava Island bounds
ALTER TABLE directory_entries
ADD COLUMN latitude DECIMAL(10, 8)
  CHECK (latitude BETWEEN 14.80 AND 14.90);
```

## Quick Reference

**Always Use**:
- Sequential version numbering (V001, V002, ...)
- Descriptive migration names
- `CONCURRENTLY` for index creation
- Nullable new columns for backward compatibility
- Geographic constraints for Brava coordinates
- Comments documenting purpose
- STI pattern for DirectoryEntry subtypes

**Never Do**:
- Create separate tables for STI subtypes
- Add NOT NULL without default values
- Create blocking indexes in production
- Skip rollback testing
- Ignore geographic validation
- Break backward compatibility

**Reference Before Migration**:
- `docs/API_CODING_STANDARDS.md` - STI patterns and standards
- `backend/src/main/resources/db/migration/` - Existing migrations for consistency
