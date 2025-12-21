# SQL Examples for Nos Ilha

Reference SQL patterns for Single Table Inheritance and performance optimization.

## Single Table Inheritance Pattern

```sql
-- DirectoryEntry base table with discriminator pattern
CREATE TABLE directory_entries (
  id UUID PRIMARY KEY,
  category VARCHAR(50) NOT NULL,  -- Discriminator (Restaurant, Hotel, Landmark, Beach)
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

## Flyway Migration Example

```sql
-- V023__add_cultural_significance.sql
ALTER TABLE directory_entries
ADD COLUMN cultural_significance_rating INTEGER
CHECK (cultural_significance_rating >= 1 AND cultural_significance_rating <= 10);

COMMENT ON COLUMN directory_entries.cultural_significance_rating
IS 'Community-assessed cultural significance rating (1-10 scale)';

CREATE INDEX CONCURRENTLY idx_directory_entries_category_significance
ON directory_entries (category, cultural_significance_rating)
WHERE cultural_significance_rating IS NOT NULL;
```

## Performance Index Strategies

### Geographic Queries (GIST)
```sql
CREATE INDEX CONCURRENTLY idx_directory_entries_location
ON directory_entries USING GIST (
  ST_Point(longitude, latitude)
) WHERE latitude BETWEEN 14.80 AND 14.90
  AND longitude BETWEEN -24.75 AND -24.65;
```

### Full-Text Search (GIN for Portuguese)
```sql
CREATE INDEX CONCURRENTLY idx_directory_entries_search
ON directory_entries USING GIN (
  to_tsvector('portuguese', name || ' ' || COALESCE(description, ''))
);
```

### Category Filtering (Composite)
```sql
CREATE INDEX CONCURRENTLY idx_directory_entries_category_town
ON directory_entries (category, town)
WHERE category IS NOT NULL AND town IS NOT NULL;
```
