# Data Agent Knowledge Base

## Domain Expertise: PostgreSQL + Database Architecture + Performance Optimization

### Architecture Overview
```
Application Layer (Spring Boot)
    ↓
JPA/Hibernate (ORM)
    ↓
PostgreSQL Database (Primary)
    ↓
Flyway Migrations (Version Control)
    ↓
HikariCP Connection Pool
```

### Key Technologies
- **PostgreSQL 15** - Primary relational database for structured tourism data
- **Flyway** - Database migration and version control
- **JPA/Hibernate** - Object-relational mapping with Spring Data
- **HikariCP** - High-performance connection pooling
- **Single Table Inheritance** - DirectoryEntry hierarchy optimization
- **PostGIS** (future) - Geospatial data extensions for location-based queries

## Core Database Patterns

### 1. Single Table Inheritance Schema
```sql
-- V1__Create_directory_entries_table.sql
CREATE TABLE directory_entries (
    -- Primary key and audit fields
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Discriminator for inheritance
    entry_type VARCHAR(50) NOT NULL,
    
    -- Common tourism fields
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    
    -- Location data
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    
    -- Contact information
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(500),
    
    -- Tourism metadata
    rating DECIMAL(3, 2),
    price_range VARCHAR(20),
    is_featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    
    -- Restaurant-specific fields
    cuisine VARCHAR(100),
    hours VARCHAR(255),
    menu_url VARCHAR(500),
    dietary_options TEXT[], -- Array for multiple options
    
    -- Hotel-specific fields
    amenities TEXT[],
    room_types TEXT[],
    check_in_time TIME,
    check_out_time TIME,
    
    -- Landmark-specific fields
    historical_info TEXT,
    visiting_hours VARCHAR(255),
    entrance_fee DECIMAL(10, 2),
    historical_period VARCHAR(100),
    
    -- Beach-specific fields
    beach_activities TEXT[],
    facilities TEXT[],
    water_conditions VARCHAR(100),
    safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5)
);

-- Indexes for performance optimization
CREATE INDEX idx_directory_entries_category ON directory_entries(category);
CREATE INDEX idx_directory_entries_type ON directory_entries(entry_type);
CREATE INDEX idx_directory_entries_location ON directory_entries(latitude, longitude);
CREATE INDEX idx_directory_entries_rating ON directory_entries(rating DESC);
CREATE INDEX idx_directory_entries_featured ON directory_entries(is_featured, category);
CREATE INDEX idx_directory_entries_status ON directory_entries(status);

-- Full-text search index for tourism content
CREATE INDEX idx_directory_entries_search ON directory_entries 
USING gin(to_tsvector('english', name || ' ' || coalesce(description, '')));

-- Constraint to ensure location data integrity
ALTER TABLE directory_entries 
ADD CONSTRAINT check_location_complete 
CHECK ((latitude IS NULL AND longitude IS NULL) OR (latitude IS NOT NULL AND longitude IS NOT NULL));

-- Constraint to ensure discriminator matches category
ALTER TABLE directory_entries 
ADD CONSTRAINT check_type_category_alignment 
CHECK (
    (entry_type = 'RESTAURANT' AND category = 'RESTAURANT') OR
    (entry_type = 'HOTEL' AND category = 'HOTEL') OR
    (entry_type = 'LANDMARK' AND category = 'LANDMARK') OR
    (entry_type = 'BEACH' AND category = 'BEACH')
);
```

### 2. Tourism Supporting Tables
```sql
-- V2__Create_towns_table.sql
CREATE TABLE towns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    
    -- Geographic data
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    
    -- Tourism information
    population INTEGER,
    elevation_meters INTEGER,
    tourist_info TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_towns_location ON towns(latitude, longitude);

-- V3__Create_media_metadata_table.sql  
CREATE TABLE media_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- File information
    file_name VARCHAR(255) NOT NULL,
    gcs_path VARCHAR(500) NOT NULL UNIQUE,
    public_url VARCHAR(500) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    
    -- Tourism categorization
    category VARCHAR(50) NOT NULL,
    entry_id UUID REFERENCES directory_entries(id) ON DELETE CASCADE,
    
    -- AI analysis results (stored as JSONB for flexibility)
    ai_analysis JSONB,
    
    -- Processing status
    processing_status VARCHAR(50) DEFAULT 'PENDING',
    processed_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_metadata_entry_id ON media_metadata(entry_id);
CREATE INDEX idx_media_metadata_category ON media_metadata(category);
CREATE INDEX idx_media_metadata_status ON media_metadata(processing_status);

-- GIN index for AI analysis JSON queries
CREATE INDEX idx_media_metadata_ai_labels ON media_metadata 
USING gin((ai_analysis->'labels'));
```

### 3. Performance Optimization Queries
```sql
-- Optimized tourism search with multiple filters
CREATE OR REPLACE FUNCTION search_tourism_entries(
    p_category VARCHAR DEFAULT NULL,
    p_search_text TEXT DEFAULT NULL,
    p_min_rating DECIMAL DEFAULT NULL,
    p_price_range VARCHAR DEFAULT NULL,
    p_latitude DECIMAL DEFAULT NULL,
    p_longitude DECIMAL DEFAULT NULL,
    p_radius_km DECIMAL DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    category VARCHAR,
    rating DECIMAL,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        de.id,
        de.name,
        de.description,
        de.category,
        de.rating,
        CASE 
            WHEN p_latitude IS NOT NULL AND p_longitude IS NOT NULL 
                AND de.latitude IS NOT NULL AND de.longitude IS NOT NULL
            THEN (
                6371 * acos(
                    cos(radians(p_latitude)) * cos(radians(de.latitude)) *
                    cos(radians(de.longitude) - radians(p_longitude)) +
                    sin(radians(p_latitude)) * sin(radians(de.latitude))
                )
            )
            ELSE NULL
        END AS distance_km
    FROM directory_entries de
    WHERE 
        de.status = 'ACTIVE'
        AND (p_category IS NULL OR de.category = p_category)
        AND (p_search_text IS NULL OR 
             to_tsvector('english', de.name || ' ' || coalesce(de.description, '')) 
             @@ plainto_tsquery('english', p_search_text))
        AND (p_min_rating IS NULL OR de.rating >= p_min_rating)
        AND (p_price_range IS NULL OR de.price_range = p_price_range)
        AND (p_latitude IS NULL OR p_longitude IS NULL OR p_radius_km IS NULL OR
             (de.latitude IS NOT NULL AND de.longitude IS NOT NULL AND
              6371 * acos(
                  cos(radians(p_latitude)) * cos(radians(de.latitude)) *
                  cos(radians(de.longitude) - radians(p_longitude)) +
                  sin(radians(p_latitude)) * sin(radians(de.latitude))
              ) <= p_radius_km))
    ORDER BY 
        CASE WHEN de.is_featured THEN 0 ELSE 1 END,
        de.rating DESC NULLS LAST,
        distance_km ASC NULLS LAST
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Tourism statistics for analytics
CREATE OR REPLACE VIEW tourism_statistics AS
SELECT 
    category,
    COUNT(*) as total_entries,
    COUNT(CASE WHEN rating IS NOT NULL THEN 1 END) as rated_entries,
    ROUND(AVG(rating), 2) as average_rating,
    COUNT(CASE WHEN is_featured THEN 1 END) as featured_entries,
    COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as entries_with_location
FROM directory_entries 
WHERE status = 'ACTIVE'
GROUP BY category;
```

## Database Migration Strategies

### 1. Flyway Migration Best Practices
```sql
-- Migration naming convention: V{version}__{description}.sql
-- V1__Initial_schema.sql
-- V2__Add_towns_table.sql  
-- V3__Add_media_metadata.sql
-- V4__Add_search_indexes.sql

-- V4__Add_search_indexes.sql
-- Always use IF NOT EXISTS for backward compatibility
CREATE INDEX IF NOT EXISTS idx_directory_entries_search 
ON directory_entries USING gin(to_tsvector('english', name || ' ' || coalesce(description, '')));

-- Add columns safely with defaults
ALTER TABLE directory_entries 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Update existing data in smaller batches for performance
DO $$
DECLARE
    batch_size INTEGER := 1000;
    total_rows INTEGER;
    processed_rows INTEGER := 0;
BEGIN
    SELECT COUNT(*) INTO total_rows FROM directory_entries WHERE search_vector IS NULL;
    
    WHILE processed_rows < total_rows LOOP
        UPDATE directory_entries 
        SET search_vector = to_tsvector('english', name || ' ' || coalesce(description, ''))
        WHERE id IN (
            SELECT id FROM directory_entries 
            WHERE search_vector IS NULL 
            LIMIT batch_size
        );
        
        processed_rows := processed_rows + batch_size;
        RAISE NOTICE 'Processed % of % rows', processed_rows, total_rows;
    END LOOP;
END $$;
```

### 2. Data Seeding for Tourism Content
```sql
-- V5__Seed_brava_island_data.sql
-- Insert sample towns for Brava Island
INSERT INTO towns (id, name, description, latitude, longitude, population) VALUES
(gen_random_uuid(), 'Nova Sintra', 'Capital city of Brava Island with historic Portuguese architecture', 14.8732, -24.7063, 1500),
(gen_random_uuid(), 'Fajã de Água', 'Coastal village known for traditional fishing and beautiful beaches', 14.8234, -24.6891, 800),
(gen_random_uuid(), 'Furna', 'Mountain village with stunning valley views and hiking trails', 14.8567, -24.6934, 600),
(gen_random_uuid(), 'Cachaço', 'Remote village offering authentic Cape Verdean rural experience', 14.8445, -24.7123, 400)
ON CONFLICT (name) DO NOTHING;

-- Insert sample directory entries
INSERT INTO directory_entries (
    entry_type, category, name, description, latitude, longitude, 
    cuisine, hours, is_featured
) VALUES 
(
    'RESTAURANT', 'RESTAURANT', 
    'Casa Nova', 
    'Traditional Cape Verdean restaurant serving fresh seafood and local specialties with ocean views',
    14.8732, -24.7063,
    'Cape Verdean', 
    'Mon-Sat 11:00-22:00',
    true
),
(
    'HOTEL', 'HOTEL',
    'Pensão Bela Vista',
    'Charming guesthouse in Nova Sintra with panoramic mountain and ocean views',
    14.8745, -24.7058,
    NULL,
    NULL,
    true
),
(
    'LANDMARK', 'LANDMARK',
    'Church of Nossa Senhora do Monte',
    'Historic 19th-century church perched on a hill overlooking Nova Sintra',
    14.8756, -24.7045,
    NULL,
    NULL,
    true
),
(
    'BEACH', 'BEACH',
    'Fajã Beach',
    'Black sand beach perfect for swimming and relaxing, protected from Atlantic waves',
    14.8234, -24.6891,
    NULL,
    NULL,
    true
)
ON CONFLICT DO NOTHING;
```

## Performance Monitoring & Optimization

### 1. Database Performance Analysis
```sql
-- Query performance monitoring
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
WHERE mean_time > 100 -- Queries taking more than 100ms on average
ORDER BY mean_time DESC;

-- Index usage analysis
CREATE OR REPLACE VIEW index_usage AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan,
    CASE 
        WHEN idx_scan = 0 THEN 'Unused'
        WHEN idx_tup_read = 0 THEN 'Write-only'
        ELSE 'Active'
    END as status
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- Table statistics for tourism content
CREATE OR REPLACE VIEW table_statistics AS
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_tup_hot_upd as hot_updates,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

### 2. Connection Pool Optimization
```yaml
# application.yml - Production database configuration
spring:
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    hikari:
      # Connection pool optimization for tourism workload
      maximum-pool-size: 20        # Max connections for Cloud Run instances
      minimum-idle: 5              # Always keep some connections ready
      idle-timeout: 300000         # 5 minutes idle timeout
      connection-timeout: 30000    # 30 seconds connection timeout
      max-lifetime: 1800000        # 30 minutes max connection lifetime
      leak-detection-threshold: 60000  # 1 minute leak detection
      
      # Tourism-specific optimizations
      connection-init-sql: "SET search_path TO public; SET timezone TO 'UTC';"
      
      # Performance monitoring
      register-mbeans: true
      
  jpa:
    hibernate:
      ddl-auto: validate            # Never auto-modify production schema
    properties:
      hibernate:
        # Query optimization
        jdbc.batch_size: 25
        order_inserts: true
        order_updates: true
        
        # Connection handling
        connection.provider_disables_autocommit: true
        
        # Tourism search optimization
        default_schema: public
        
        # Statistics for monitoring
        generate_statistics: true
        session.events.log.LOG_QUERIES_SLOWER_THAN_MS: 1000
```

## Data Integrity & Constraints

### 1. Business Logic Constraints
```sql
-- Tourism-specific business rules
ALTER TABLE directory_entries 
ADD CONSTRAINT check_rating_range 
CHECK (rating IS NULL OR (rating >= 0.0 AND rating <= 5.0));

ALTER TABLE directory_entries 
ADD CONSTRAINT check_price_range_values
CHECK (price_range IS NULL OR price_range IN ('$', '$$', '$$$', '$$$$'));

ALTER TABLE directory_entries
ADD CONSTRAINT check_brava_island_coordinates
CHECK (
    (latitude IS NULL AND longitude IS NULL) OR
    (latitude BETWEEN 14.80 AND 14.90 AND longitude BETWEEN -24.75 AND -24.65)
);

-- Restaurant-specific constraints
ALTER TABLE directory_entries
ADD CONSTRAINT check_restaurant_fields
CHECK (
    (entry_type != 'RESTAURANT') OR 
    (entry_type = 'RESTAURANT' AND cuisine IS NOT NULL)
);

-- Hotel-specific constraints  
ALTER TABLE directory_entries
ADD CONSTRAINT check_hotel_times
CHECK (
    (entry_type != 'HOTEL') OR
    (check_in_time IS NULL OR check_out_time IS NULL) OR
    (check_in_time < check_out_time)
);
```

### 2. Audit Trail Implementation
```sql
-- V6__Add_audit_trail.sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by VARCHAR(255),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(changed_at);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, operation, old_values)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, operation, old_values, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, operation, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger to directory_entries
CREATE TRIGGER directory_entries_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON directory_entries
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

## Backup & Recovery Strategies

### 1. Automated Backup Procedures
```bash
#!/bin/bash
# scripts/backup-database.sh

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_NAME="${DB_NAME:-nosilha_db}"
DB_USER="${DB_USER:-nosilha}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

# Create backup with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

echo "Creating backup: $BACKUP_FILE"

# Create comprehensive backup including tourism data
pg_dump \
    --host="$DB_HOST" \
    --username="$DB_USER" \
    --dbname="$DB_NAME" \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --format=custom \
    --compress=9 \
    --file="$BACKUP_FILE"

# Verify backup integrity
pg_restore --list "$BACKUP_FILE" > /dev/null
echo "Backup verification successful"

# Clean up old backups
find "$BACKUP_DIR" -name "backup_*.sql" -mtime +$RETENTION_DAYS -delete
echo "Cleaned up backups older than $RETENTION_DAYS days"

# Upload to Google Cloud Storage for off-site backup
gsutil cp "$BACKUP_FILE" "gs://nosilha-backups/database/"
echo "Backup uploaded to Google Cloud Storage"
```

### 2. Point-in-Time Recovery
```bash
#!/bin/bash
# scripts/restore-database.sh

set -e

BACKUP_FILE="${1:?Please specify backup file}"
TARGET_DB="${2:-nosilha_db_restored}"

echo "Restoring database from: $BACKUP_FILE"
echo "Target database: $TARGET_DB"

# Create new database for restore
createdb "$TARGET_DB"

# Restore from backup
pg_restore \
    --dbname="$TARGET_DB" \
    --verbose \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    "$BACKUP_FILE"

echo "Database restore completed: $TARGET_DB"

# Verify critical tourism data
psql -d "$TARGET_DB" -c "
SELECT 
    category,
    COUNT(*) as count,
    COUNT(CASE WHEN latitude IS NOT NULL THEN 1 END) as with_location
FROM directory_entries 
GROUP BY category;
"
```

## Key File Locations

### Migration Files
```
backend/src/main/resources/db/migration/
├── V1__Create_directory_entries_table.sql    # Core tourism schema
├── V2__Add_towns_table.sql                   # Geographic data
├── V3__Add_media_metadata.sql                # Image/video metadata
├── V4__Add_search_indexes.sql                # Performance optimization
├── V5__Seed_brava_island_data.sql            # Sample tourism data
└── V6__Add_audit_trail.sql                   # Change tracking
```

### Configuration Files
```
backend/src/main/resources/
├── application.yml                           # Production database config
├── application-local.yml                     # Local development config
└── application-test.yml                      # Test database config
```

### Entity Mapping
```
backend/src/main/kotlin/com/nosilha/core/domain/
├── DirectoryEntry.kt                         # Base entity with STI
├── Restaurant.kt                             # Restaurant-specific fields
├── Hotel.kt                                  # Hotel-specific fields
├── Landmark.kt                               # Landmark-specific fields
└── Beach.kt                                  # Beach-specific fields
```

This knowledge base provides comprehensive coverage of PostgreSQL database design, performance optimization, and tourism-specific data management patterns for the Nos Ilha platform.