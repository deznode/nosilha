# Advanced Database Patterns

Reference guide for error handling and geographic data management.

## Error Handling

### Migration Rollback Procedures

1. **Automated Rollback**: Flyway automatically rolls back failed migrations
2. **Test First**: Validate migrations in development before production
3. **Backward Compatibility**: Design for rollback to previous application versions
4. **Validation**: Check migration syntax and logic before execution

### Data Integrity Protection

1. **Database Constraints**: Implement CHECK, NOT NULL, UNIQUE at database level
2. **Geographic Validation**: Coordinate constraints for Brava Island bounds
3. **Transaction Management**: Proper boundaries preventing partial corruption
4. **Constraint Violations**: Database-level validation catching issues early

### Connection Resilience

For Cloud Run serverless environment:

1. **Retry Logic**: Exponential backoff for transient connection failures
2. **Connection Validation**: HikariCP validation queries detecting stale connections
3. **Pool Monitoring**: Track exhaustion and adjust configuration proactively

## Geographic Data Management

For location-based heritage features:

1. **Brava Island Bounds**: Validate all coordinates
   - Latitude: 14.80 - 14.90
   - Longitude: -24.75 to -24.65

2. **PostGIS Functions**: Use spatial functions for proximity searches

3. **GIST Indexes**: Optimize location-based heritage discovery queries

4. **Spatial Relationships**: Support queries for:
   - Nearest landmark
   - Within radius
   - Heritage sites in area
