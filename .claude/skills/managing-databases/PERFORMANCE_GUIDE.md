# Database Performance Guide

This guide provides indexing strategies, query optimization techniques, and connection pooling patterns for the Nos Ilha cultural heritage platform.

## Performance Targets

**Query Response Time**: <100ms for 95th percentile heritage searches
**Index Utilization**: >95% for frequently executed queries
**Connection Pool Efficiency**: Optimized for Cloud Run serverless scaling
**Migration Execution**: <30 seconds with zero downtime

## Indexing Strategies

### 1. Geographic GIST Indexes

**Use Case**: Location-based heritage searches within Brava Island

**Performance Benefit**: Spatial queries 10-100x faster than full table scan

**Pattern**:
```sql
CREATE INDEX CONCURRENTLY idx_directory_entries_location
  ON directory_entries USING GIST (
    ST_Point(longitude, latitude)
  )
  WHERE latitude BETWEEN 14.80 AND 14.90
    AND longitude BETWEEN -24.75 AND -24.65;
```

**Query Optimization**:
```sql
-- Efficient proximity search using spatial index
SELECT id, name, latitude, longitude
FROM directory_entries
WHERE category = 'Landmark'
  AND ST_DWithin(
    ST_Point(longitude, latitude),
    ST_Point(-24.70, 14.85),  -- Nova Sintra coordinates
    0.05  -- ~5km radius
  );
```

**Index Maintenance**:
- GIST indexes require VACUUM for optimal performance
- Monitor index bloat with `pg_stat_all_indexes`
- Rebuild if index size exceeds 2x expected

### 2. Full-Text Search GIN Indexes

**Use Case**: Cultural heritage content discovery by name/description

**Performance Benefit**: Text search 50-200x faster than LIKE queries

**Pattern**:
```sql
CREATE INDEX CONCURRENTLY idx_directory_entries_search
  ON directory_entries USING GIN (
    to_tsvector('portuguese', name || ' ' || COALESCE(description, ''))
  );
```

**Query Optimization**:
```sql
-- Efficient full-text search using GIN index
SELECT id, name, description
FROM directory_entries
WHERE to_tsvector('portuguese', name || ' ' || COALESCE(description, ''))
  @@ to_tsquery('portuguese', 'morna & musica');
```

**Search Ranking**:
```sql
-- Add relevance ranking for search results
SELECT id, name,
  ts_rank(
    to_tsvector('portuguese', name || ' ' || description),
    to_tsquery('portuguese', 'cachupa')
  ) AS rank
FROM directory_entries
WHERE to_tsvector('portuguese', name || ' ' || description)
  @@ to_tsquery('portuguese', 'cachupa')
ORDER BY rank DESC
LIMIT 20;
```

### 3. Composite Indexes

**Use Case**: Multi-column filtering (category + town, category + rating)

**Performance Benefit**: Combined filters 20-50x faster than separate indexes

**Pattern**:
```sql
CREATE INDEX CONCURRENTLY idx_directory_entries_category_town
  ON directory_entries (category, town)
  WHERE category IS NOT NULL AND town IS NOT NULL;
```

**Query Optimization**:
```sql
-- Efficient multi-column filter using composite index
SELECT id, name, category, town
FROM directory_entries
WHERE category = 'Restaurant'
  AND town = 'Nova Sintra'
ORDER BY name;
```

**Column Order Matters**:
- Index on (category, town) efficient for:
  - `WHERE category = 'Restaurant' AND town = 'Nova Sintra'` ✅
  - `WHERE category = 'Restaurant'` ✅
  - `WHERE town = 'Nova Sintra'` ❌ (doesn't use index)

- Create separate indexes if filtering on second column alone is common

### 4. Partial Indexes

**Use Case**: Subtype-specific queries (e.g., only Restaurants or high-significance entries)

**Performance Benefit**: Smaller index size, faster queries, reduced maintenance

**Pattern**:
```sql
CREATE INDEX CONCURRENTLY idx_restaurants_cuisine
  ON directory_entries (cuisine_type)
  WHERE category = 'Restaurant' AND cuisine_type IS NOT NULL;
```

**Query Optimization**:
```sql
-- Efficient Restaurant-specific query using partial index
SELECT id, name, cuisine_type
FROM directory_entries
WHERE category = 'Restaurant'
  AND cuisine_type = 'Traditional Cape Verdean';
```

**When to Use**:
- Query filters on discriminator column (category = 'Restaurant')
- Filtering on nullable fields with many NULLs
- Query patterns specific to one STI subtype
- Targeting commonly queried subset of data

### 5. Expression Indexes

**Use Case**: Queries filtering on computed values (lowercase search, date extraction)

**Pattern**:
```sql
-- Index on lowercase name for case-insensitive search
CREATE INDEX CONCURRENTLY idx_directory_entries_name_lower
  ON directory_entries (LOWER(name));
```

**Query Optimization**:
```sql
-- Efficient case-insensitive search using expression index
SELECT id, name
FROM directory_entries
WHERE LOWER(name) LIKE LOWER('%morabeza%');
```

## Query Optimization Techniques

### 1. Avoid N+1 Query Problems

**Problem**: Loading collection with separate query for each item

**Bad Pattern** (N+1 queries):
```kotlin
// Loads all entries with separate query for each
val entries = repository.findAll()
entries.forEach { entry ->
  // Separate query for each entry's user
  val user = userRepository.findById(entry.createdByUserId)
}
```

**Good Pattern** (1 query with JOIN):
```kotlin
// Single query with JOIN fetch
@Query("SELECT e FROM DirectoryEntry e LEFT JOIN FETCH e.createdByUser")
fun findAllWithUser(): List<DirectoryEntry>
```

### 2. Use Pagination for Large Result Sets

**Bad Pattern** (loads all data):
```kotlin
fun getAllRestaurants(): List<Restaurant> {
  return repository.findByCategory("Restaurant")
}
```

**Good Pattern** (paginated results):
```kotlin
fun getRestaurants(page: Int, size: Int): Page<Restaurant> {
  val pageable = PageRequest.of(page, size, Sort.by("name"))
  return repository.findByCategory("Restaurant", pageable)
}
```

### 3. Leverage STI Discriminator for Efficient Filtering

**Bad Pattern** (type checking in application):
```kotlin
// Loads all entries, filters in memory
val allEntries = repository.findAll()
val restaurants = allEntries.filterIsInstance<Restaurant>()
```

**Good Pattern** (discriminator column filter):
```kotlin
// Efficient query using discriminator index
@Query("SELECT r FROM Restaurant r WHERE r.category = 'Restaurant'")
fun findAllRestaurants(): List<Restaurant>
```

### 4. Use EXPLAIN ANALYZE for Query Planning

**Identify Query Performance Issues**:
```sql
EXPLAIN ANALYZE
SELECT id, name, category
FROM directory_entries
WHERE category = 'Restaurant'
  AND town = 'Nova Sintra';
```

**Key Metrics to Check**:
- **Index Scan** vs **Seq Scan**: Index scan is faster
- **Rows Removed by Filter**: High value indicates missing index
- **Execution Time**: Should be <100ms for most queries
- **Buffers**: High shared hit ratio (>95%) is good

**Example Output Analysis**:
```
Index Scan using idx_directory_entries_category_town  (cost=0.15..8.17 rows=5 width=50) (actual time=0.025..0.045 rows=7 loops=1)
  Index Cond: ((category = 'Restaurant') AND (town = 'Nova Sintra'))
Planning Time: 0.105 ms
Execution Time: 0.078 ms
```
- ✅ Uses index (Index Scan)
- ✅ Fast execution (<100ms)
- ✅ Low cost (0.15..8.17)

### 5. Monitor Slow Queries

**Enable Slow Query Logging** (application.yml):
```yaml
spring:
  jpa:
    properties:
      hibernate:
        show_sql: false
        use_sql_comments: true
      logging:
        level:
          org.hibernate.SQL: DEBUG
          org.hibernate.type.descriptor.sql.BasicBinder: TRACE
```

**PostgreSQL Slow Query Log**:
```sql
-- Enable logging for queries >100ms
ALTER DATABASE nosilha_db
  SET log_min_duration_statement = 100;

-- View slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 20;
```

## Connection Pooling (HikariCP)

### Cloud Run Serverless Optimization

**Configuration** (application.yml):
```yaml
spring:
  datasource:
    hikari:
      # Optimize for Cloud Run serverless scaling with Supabase Session Mode pooler
      minimum-idle: 0              # CRITICAL: Allows pool to scale to zero during idle periods
      maximum-pool-size: 10        # Session Mode optimized (3 instances × 10 = 30 connections max)
      connection-timeout: 20000    # 20 seconds connection timeout
      idle-timeout: 300000         # 5 minutes idle timeout (longer for Session Mode persistence)
      max-lifetime: 1800000        # 30 minutes max connection lifetime (Session Mode supports longer)
      leak-detection-threshold: 30000  # 30 seconds leak detection (earlier detection)

      # Connection validation
      connection-test-query: SELECT 1
      validation-timeout: 3000     # 3 seconds validation timeout
```

**Configuration Rationale**:
- **minimum-idle: 0**: CRITICAL for Cloud Run scale-to-zero capability during idle periods (serverless optimization)
- **maximum-pool-size: 10**: Limit connections for Cloud Run instance constraints (3 instances × 10 = 30 connections maximum)
- **idle-timeout: 5 minutes**: Close idle connections to free resources (Session Mode supports longer persistence than Transaction Mode)
- **max-lifetime: 30 minutes**: Refresh connections before database timeout (Session Mode supports longer connection lifetimes)
- **leak-detection-threshold: 30 seconds**: Detect connection leaks early for faster troubleshooting
- **validation-timeout: 3 seconds**: Fast validation checks to prevent blocking request threads

### Connection Pool Monitoring

**Monitor Pool Metrics**:
```kotlin
@Component
class HikariPoolMonitor(
  private val dataSource: DataSource
) {
  @Scheduled(fixedRate = 60000)  // Every minute
  fun logPoolMetrics() {
    if (dataSource is HikariDataSource) {
      val pool = dataSource.hikariPoolMXBean
      logger.info(
        "HikariCP - Active: ${pool.activeConnections}, " +
        "Idle: ${pool.idleConnections}, " +
        "Total: ${pool.totalConnections}, " +
        "Threads Awaiting: ${pool.threadsAwaitingConnection}"
      )
    }
  }
}
```

**Alert Conditions**:
- `threadsAwaitingConnection > 0`: Pool exhaustion, increase maximum-pool-size
- `activeConnections / totalConnections > 0.8`: Near capacity, monitor closely
- `idleConnections = 0` consistently: Increase minimum-idle

### Transaction Management

**Proper Transaction Boundaries**:
```kotlin
@Service
class DirectoryEntryService(
  private val repository: DirectoryEntryRepository
) {
  @Transactional(readOnly = true)
  fun findRestaurants(town: String): List<Restaurant> {
    // Read-only transaction, connection released quickly
    return repository.findByCategoryAndTown("Restaurant", town)
  }

  @Transactional
  fun createEntry(entry: DirectoryEntry): DirectoryEntry {
    // Write transaction, keep short to avoid lock contention
    validateBravaCoordinates(entry)
    return repository.save(entry)
  }
}
```

**Best Practices**:
- Use `@Transactional(readOnly = true)` for read operations
- Keep transactions short to minimize lock duration
- Avoid external API calls within transactions
- Use isolation level appropriately (default READ_COMMITTED is usually fine)

## Index Maintenance

### Monitoring Index Health

**Check Index Usage**:
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
```

**Identify Unused Indexes** (0 scans):
```sql
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexname NOT LIKE 'pk_%';  -- Exclude primary keys
```

**Check Index Bloat**:
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  idx_scan,
  idx_tup_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### VACUUM and ANALYZE

**Regular Maintenance**:
```sql
-- Analyze table statistics for query planner
ANALYZE directory_entries;

-- Vacuum to reclaim space and update visibility map
VACUUM ANALYZE directory_entries;

-- Full vacuum (rebuilds table, requires lock)
VACUUM FULL directory_entries;  -- Use sparingly
```

**Automatic VACUUM Configuration**:
```sql
-- Check autovacuum settings
SHOW autovacuum;
SHOW autovacuum_vacuum_scale_factor;
SHOW autovacuum_analyze_scale_factor;

-- Tune for active table
ALTER TABLE directory_entries
  SET (autovacuum_vacuum_scale_factor = 0.05);  -- Vacuum at 5% dead tuples
```

## Performance Monitoring

### Database Metrics to Track

**Query Performance**:
- Average query execution time (<100ms target)
- 95th percentile query time (<200ms acceptable)
- Slow query count (minimize queries >500ms)

**Connection Pool**:
- Active connections (should be <80% of maximum)
- Idle connections (should match minimum-idle setting)
- Connection wait time (should be 0ms most of the time)

**Index Utilization**:
- Index scan ratio (>95% for indexed queries)
- Sequential scan frequency (minimize for large tables)
- Index hit ratio (>95% from shared buffers)

**Database Size**:
- Table size growth rate
- Index size growth rate
- Total database size (<10GB for free tier PostgreSQL)

### Performance Testing Checklist

Before deploying database changes:

- [ ] EXPLAIN ANALYZE shows index usage for new query patterns
- [ ] Query execution time <100ms for 95th percentile
- [ ] No N+1 query problems in application code
- [ ] Pagination implemented for large result sets
- [ ] Indexes created with CONCURRENTLY (zero downtime)
- [ ] Connection pool metrics healthy (no exhaustion)
- [ ] Transaction boundaries appropriate (read-only vs write)
- [ ] Geographic constraints enforced for Brava coordinates
- [ ] STI discriminator column used efficiently
- [ ] Full-text search uses GIN index (not LIKE '%term%')

## Common Performance Issues

### Issue 1: Full Table Scans

**Symptom**: Queries taking >1 second on small datasets

**Diagnosis**:
```sql
EXPLAIN ANALYZE
SELECT * FROM directory_entries WHERE town = 'Nova Sintra';
```

**If shows "Seq Scan"**, create index:
```sql
CREATE INDEX CONCURRENTLY idx_directory_entries_town
  ON directory_entries(town);
```

### Issue 2: Connection Pool Exhaustion

**Symptom**: "Connection timeout" errors, high request latency

**Diagnosis**: Check HikariCP metrics:
- `threadsAwaitingConnection > 0`
- `activeConnections = maximumPoolSize`

**Solution**: Increase maximum-pool-size or optimize transaction duration

### Issue 3: High Index Bloat

**Symptom**: Index size 2-3x larger than expected, slow index scans

**Diagnosis**:
```sql
SELECT pg_size_pretty(pg_relation_size('idx_directory_entries_location'));
```

**Solution**: Rebuild index:
```sql
DROP INDEX CONCURRENTLY idx_directory_entries_location;
CREATE INDEX CONCURRENTLY idx_directory_entries_location
  ON directory_entries USING GIST (ST_Point(longitude, latitude));
```

### Issue 4: Inefficient TEXT Search with LIKE

**Symptom**: `WHERE name LIKE '%term%'` queries very slow

**Bad Pattern**:
```sql
SELECT * FROM directory_entries WHERE name LIKE '%cachupa%';
```

**Solution**: Use full-text search with GIN index:
```sql
SELECT * FROM directory_entries
WHERE to_tsvector('portuguese', name)
  @@ to_tsquery('portuguese', 'cachupa');
```

## Quick Reference

**Geographic Searches**: Use GIST spatial indexes
**Text Searches**: Use GIN full-text indexes
**Multi-Column Filters**: Use composite indexes
**Subtype Queries**: Use partial indexes with WHERE clause
**Large Result Sets**: Use pagination (Page<T>)
**N+1 Problems**: Use JOIN FETCH in JPA queries
**Slow Queries**: Use EXPLAIN ANALYZE to diagnose
**Connection Pooling**: Monitor HikariCP metrics
**Index Maintenance**: VACUUM ANALYZE regularly
**Performance Target**: <100ms for 95th percentile queries

**Always Reference**: `docs/API_CODING_STANDARDS.md` for database standards
