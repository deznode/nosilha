# Gallery Backend Implementation

**Status:** Active  
**Priority:** Medium  
**Estimated Time:** 8-12 hours  
**Dependencies:** Gallery API integration completion

## What & Why
- **Problem:** Gallery UI exists with mock data but needs complete backend API implementation for photo collections, cultural context, and CRUD operations
- **Solution:** Implement comprehensive gallery backend with Spring Boot entities, repositories, and REST endpoints
- **Expected Outcome:** Full-featured photo gallery system with database persistence, category filtering, and cultural metadata

## Implementation Steps
1. [ ] Create Gallery and Photo domain entities with JPA annotations
2. [ ] Implement gallery repository layer with custom queries
3. [ ] Build comprehensive gallery REST controller with CRUD endpoints
4. [ ] Add cultural context and metadata support
5. [ ] Implement category filtering and search functionality
6. [ ] Create database migration scripts for gallery schema
7. [ ] Add gallery-specific security and authorization
8. [ ] Integrate with Google Cloud Storage for photo storage

## Files to Modify
- Create: `backend/src/main/kotlin/com/nosilha/core/domain/Gallery.kt` - Gallery entity
- Create: `backend/src/main/kotlin/com/nosilha/core/domain/Photo.kt` - Photo entity  
- Create: `backend/src/main/kotlin/com/nosilha/core/repository/jpa/GalleryRepository.kt` - Gallery data access
- Create: `backend/src/main/kotlin/com/nosilha/core/controller/GalleryController.kt` - REST endpoints
- Create: `backend/src/main/kotlin/com/nosilha/core/service/GalleryService.kt` - Business logic
- Create: `backend/src/main/kotlin/com/nosilha/core/dto/GalleryDto.kt` - Data transfer objects
- Create: `backend/src/main/resources/db/migration/V3__Create_Gallery_Tables.sql` - Database schema
- Modify: `frontend/src/lib/api.ts` - Add gallery API client functions

## Success Criteria  
- [ ] Gallery and photo entities created with proper JPA relationships
- [ ] Full CRUD operations available via REST API
- [ ] Database schema supports cultural metadata and categorization
- [ ] Frontend can create, read, update, and delete galleries
- [ ] Photo upload integration with GCS storage
- [ ] Category filtering works with backend data
- [ ] ISR caching integrates with real API responses

## Implementation Notes
- Leverage existing Spring Boot architecture patterns from DirectoryEntry
- Use single-table inheritance if galleries have different types
- Implement soft delete for photo management
- Consider implementing photo versioning for edits
- Gallery UI already exists with ISR caching (1-hour revalidation)
- Need to maintain compatibility with existing lightbox functionality

---
**Created:** 2025-01-06  
**Last Updated:** 2025-01-06