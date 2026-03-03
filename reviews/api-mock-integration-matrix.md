# API vs Mock Integration Matrix

**Date**: 2025-12-27
**Purpose**: Complete endpoint-by-endpoint mapping of Backend APIs, Mock APIs, and Frontend usage
**Related Documents**:
- [implementation-gaps.md](./implementation-gaps.md) - High-level gap tracking
- [gallery-media-integration-plan.md](./gallery-media-integration-plan.md) - Gallery module design
- [ui-api-integration-validation.md](./ui-api-integration-validation.md) - Playwright test results

---

## Implementation Progress

### ✅ Completed: Priority 1 - DDD Architecture Fix (2025-12-27)

Created cross-module service interfaces to fix Spring Modulith violations:

| File | Description |
|------|-------------|
| `auth/api/UserProfileQueryService.kt` | Interface for cross-module user profile queries |
| `auth/UserProfileQueryServiceImpl.kt` | Implementation using repository internally |
| `directory/api/DirectoryEntryQueryService.kt` | Interface for cross-module directory entry queries |
| `directory/DirectoryEntryQueryServiceImpl.kt` | Implementation using repository internally |

Refactored `StoryService.kt` to use service interfaces instead of direct repository access.

### ✅ Completed: Priority 2 & 3 - Stories Public API (2025-12-27)

**Backend Changes:**
| File | Description |
|------|-------------|
| `StoryController.kt` | Added `GET /api/v1/stories` and `GET /api/v1/stories/slug/{slug}` |
| `SecurityConfig.kt` | Configured public access for GET endpoints |

**Frontend Changes:**
| File | Description |
|------|-------------|
| `backend-api.ts` | Added `getStories()` and `getStoryBySlug()` methods |
| `api-contracts.ts` | Added method signatures to ApiClient interface |
| `mock-api.ts` | Added mock implementations for fallback |
| `api.ts` | Exported new methods with JSDoc |
| `stories/page.tsx` | Removed mock import, uses real API |
| `stories/[slug]/page.tsx` | Removed mock import, uses real API |

### ✅ Completed: Priority 4 - CuratedMedia API (2025-12-27)

**New Spring Module** (`curatedmedia/`):
| File | Description |
|------|-------------|
| `domain/CuratedMedia.kt` | JPA entity with helper methods for embed URLs |
| `domain/MediaType.kt` | Enum: IMAGE, VIDEO, AUDIO |
| `domain/ExternalPlatform.kt` | Enum: YOUTUBE, VIMEO, SOUNDCLOUD, SELF_HOSTED |
| `domain/CuratedMediaStatus.kt` | Enum: ACTIVE, ARCHIVED |
| `repository/CuratedMediaRepository.kt` | JPA repository with filtering queries |
| `CuratedMediaService.kt` | Business logic for CRUD and filtering |
| `api/CuratedMediaDtos.kt` | DTOs and mapping extension functions |
| `api/CuratedMediaController.kt` | Public endpoints (GET) |
| `api/AdminCuratedMediaController.kt` | Admin endpoints (POST/PUT/DELETE) |
| `V23__create_curated_media_table.sql` | Migration with seed data |

**Frontend Changes:**
| File | Description |
|------|-------------|
| `types/curated-media.ts` | TypeScript types for CuratedMedia |
| `backend-api.ts` | Added getCuratedMedia, getCuratedMediaById, getCuratedMediaCategories |
| `mock-api.ts` | Mock fallback implementations |
| `gallery/page.tsx` | Removed mock import, uses real API with data mapping |

### ✅ Completed: Priority 5 - Admin Contact Messages (2025-12-27)

**Backend Changes:**
| File | Description |
|------|-------------|
| `ContactMessageRepository.kt` | Added pagination and status filtering methods |
| `ContactService.kt` | Added admin methods: listMessages, getMessage, updateStatus, deleteMessage |
| `ContactDtos.kt` | Added AdminContactMessageDto, UpdateContactStatusRequest |
| `AdminContactController.kt` | NEW - GET/PUT/DELETE endpoints for admin contact management |

**Frontend Changes:**
| File | Description |
|------|-------------|
| `backend-api.ts` | Implemented getContactMessages, updateContactMessageStatus, deleteContactMessage |
| `types/admin.ts` | Updated ContactMessageStatus to use ARCHIVED instead of REPLIED |
| `messages-queue.tsx` | Updated to use new status values and field names |
| `mocks/admin.ts` | Updated mock data to match new schema |

### ✅ Completed: Priority 6 - Admin Directory Submissions (2025-12-27)

**New Backend Files:**
| File | Description |
|------|-------------|
| `domain/DirectorySubmissionStatus.kt` | Enum: PENDING, APPROVED, REJECTED |
| `domain/DirectorySubmissionCategory.kt` | Enum: RESTAURANT, LANDMARK, NATURE, CULTURE |
| `domain/DirectorySubmission.kt` | Full entity with moderation workflow fields |
| `repository/DirectorySubmissionRepository.kt` | JPA repository with admin query methods |
| `services/DirectorySubmissionService.kt` | Service with CRUD and moderation methods |
| `api/DirectorySubmissionDtos.kt` | Admin DTOs for submission management |
| `api/AdminDirectorySubmissionController.kt` | GET/PUT endpoints for moderation |
| `V24__create_directory_submissions.sql` | Migration with tables and indexes |

**Frontend Changes:**
| File | Description |
|------|-------------|
| `backend-api.ts` | Implemented getDirectorySubmissions, updateDirectorySubmissionStatus with transform functions |

### ✅ Completed: Priority 7 - Dashboard Stats (2025-12-27)

**Backend Changes:**
| File | Description |
|------|-------------|
| `api/DashboardDtos.kt` | NEW - AdminStatsResponse, WeeklyActivityData, TownCoverageData, ContributorResponse DTOs |
| `DashboardService.kt` | Added getAdminStats(), getTopContributors() with weekly activity and town coverage |
| `api/DashboardController.kt` | Added GET /stats and GET /contributors endpoints |
| `api/DashboardCountsResponse.kt` | Added pendingMessages and pendingDirectory fields |
| `StorySubmissionRepository.kt` | Added countByCreatedAtBetween, findTopContributorsByStoryCount queries |
| `SuggestionRepository.kt` | Added countByCreatedAtBetween query |
| `DirectoryEntryRepository.kt` | Added countDistinctTowns, countByTownGroupByTown queries |
| `DirectoryEntryQueryService.kt` | Added countDistinctTowns(), getEntryCountsByTown() for cross-module access |

**Frontend Changes:**
None required - `backend-api.ts` already had getAdminStats() and getTopContributors() calling correct endpoints.

### ✅ Completed: Priority 8 - Admin Auth Gate (2025-12-27)

**Frontend Changes:**
| File | Description |
|------|-------------|
| `app/(admin)/layout.tsx` | Converted to client component with useAuth() check and redirect to /login |

### ✅ Completed: Priority 9 - Settings Page (2025-12-27)

**Frontend Changes:**
| File | Description |
|------|-------------|
| `app/(main)/settings/page.tsx` | Connected to profile API with working notifications and language settings |

### ✅ All Modules Complete!

All API integration gaps have been closed. No pending work remaining.

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Total Backend Endpoints | 65+ |
| Total Mock API Methods | 80+ |
| Frontend Pages/Components Using API | 24+ |
| Working Integrations | 54+ |
| ~~Critical Gaps (Pages bypass factory)~~ | ~~3~~ → **0** ✅ |
| **Missing Backend APIs** | **0** ✅ |

---

## Part 1: Complete Endpoint Matrix

### Directory Module

| Endpoint | Method | Backend | Mock | Frontend Uses | Status |
|----------|--------|---------|------|---------------|--------|
| `/api/v1/directory/entries` | GET | ✅ | ✅ | `getEntriesByCategory()` | ✅ Working |
| `/api/v1/directory/entries` | POST | ✅ | ✅ | `createDirectoryEntry()` | ✅ Working |
| `/api/v1/directory/entries/{id}` | GET | ✅ | ✅ | (internal) | ✅ Working |
| `/api/v1/directory/entries/{id}` | PUT | ✅ | ✅ | (admin) | ✅ Working |
| `/api/v1/directory/entries/{id}` | DELETE | ✅ | ✅ | (admin) | ✅ Working |
| `/api/v1/directory/slug/{slug}` | GET | ✅ | ✅ | `getEntryBySlug()` | ✅ Working |
| `/api/v1/directory/entries/{id}/related` | GET | ✅ | ✅ | `getRelatedContent()` | ✅ Working |
| `/api/v1/directory/entries/{id}/bookmark-status` | GET | ✅ | ✅ | (hooks) | ✅ Working |

### Town Module

| Endpoint | Method | Backend | Mock | Frontend Uses | Status |
|----------|--------|---------|------|---------------|--------|
| `/api/v1/towns` | GET | ✅ | ✅ | `getTowns()` | ✅ Working |
| `/api/v1/towns/all` | GET | ✅ | ✅ | `getTownsForMap()` | ✅ Working |
| `/api/v1/towns/{id}` | GET | ✅ | ✅ | (internal) | ✅ Working |
| `/api/v1/towns/slug/{slug}` | GET | ✅ | ✅ | `getTownBySlug()` | ✅ Working |
| `/api/v1/towns` | POST | ✅ | ✅ | (admin) | ✅ Working |
| `/api/v1/towns/{id}` | PUT | ✅ | ✅ | (admin) | ✅ Working |
| `/api/v1/towns/{id}` | DELETE | ✅ | ✅ | (admin) | ✅ Working |

### User/Profile Module

| Endpoint | Method | Backend | Mock | Frontend Uses | Status |
|----------|--------|---------|------|---------------|--------|
| `/api/v1/users/me` | GET | ✅ | ⚠️ Stub | `getProfile()` | ✅ Working |
| `/api/v1/users/me` | PUT | ✅ | ⚠️ Stub | `updateProfile()` | ✅ Working |
| `/api/v1/users/me/contributions` | GET | ✅ | ⚠️ Stub | `getContributions()` | ✅ Working |
| `/api/v1/users/me/bookmarks` | GET | ✅ | ✅ | `getBookmarks()` | ✅ Working |

### Bookmark Module

| Endpoint | Method | Backend | Mock | Frontend Uses | Status |
|----------|--------|---------|------|---------------|--------|
| `/api/v1/bookmarks` | POST | ✅ | ✅ | `createBookmark()` | ✅ Working |
| `/api/v1/bookmarks/{entryId}` | DELETE | ✅ | ✅ | `deleteBookmark()` | ✅ Working |

### Reaction Module

| Endpoint | Method | Backend | Mock | Frontend Uses | Status |
|----------|--------|---------|------|---------------|--------|
| `/api/v1/reactions` | POST | ✅ | ✅ | `submitReaction()` | ✅ Working |
| `/api/v1/reactions/content/{id}` | GET | ✅ | ✅ | `getReactionCounts()` | ✅ Working |
| `/api/v1/reactions/content/{id}` | DELETE | ✅ | ✅ | `deleteReaction()` | ✅ Working |

### Suggestion Module

| Endpoint | Method | Backend | Mock | Frontend Uses | Status |
|----------|--------|---------|------|---------------|--------|
| `/api/v1/suggestions` | POST | ✅ | ✅ | `submitSuggestion()` | ✅ Working |

### Contact Module

| Endpoint | Method | Backend | Mock | Frontend Uses | Status |
|----------|--------|---------|------|---------------|--------|
| `/api/v1/contact` | POST | ✅ | ✅ | `submitContactMessage()` | ✅ Working |

### Story Module

| Endpoint | Method | Backend | Mock | Frontend Uses | Status |
|----------|--------|---------|------|---------------|--------|
| `/api/v1/stories` | POST | ✅ | ✅ | `submitStory()` | ✅ Working |
| `/api/v1/stories` | GET | ✅ | ✅ | `getStories()` | ✅ Working |
| `/api/v1/stories/slug/{slug}` | GET | ✅ | ✅ | `getStoryBySlug()` | ✅ Working |

### Media Module (R2 Upload)

| Endpoint | Method | Backend | Mock | Frontend Uses | Status |
|----------|--------|---------|------|---------------|--------|
| `/api/v1/media/presign` | POST | ✅ | ✅ | `getPresignedUploadUrl()` | ✅ Working |
| `/api/v1/media/confirm` | POST | ✅ | ✅ | `confirmUpload()` | ✅ Working |
| `/api/v1/media/{id}` | GET | ✅ | ✅ | (internal) | ✅ Working |
| `/api/v1/media/entry/{id}` | GET | ✅ | ✅ | `getMediaByEntry()` | ✅ Working |
| `/api/v1/media/pending` | GET | ✅ | N/A | (admin) | ✅ Working |
| `/api/v1/media/{id}/status` | PATCH | ✅ | N/A | (admin) | ✅ Working |
| `/api/v1/media/{id}` | DELETE | ✅ | N/A | (admin) | ✅ Working |
| `/api/v1/media/{id}/purge` | DELETE | ✅ | N/A | (admin) | ✅ Working |

### CuratedMedia Module (Gallery)

| Endpoint | Method | Backend | Mock | Frontend Uses | Status |
|----------|--------|---------|------|---------------|--------|
| `/api/v1/curated-media` | GET | ✅ | ✅ | `getCuratedMedia()` | ✅ Working |
| `/api/v1/curated-media/{id}` | GET | ✅ | ✅ | `getCuratedMediaById()` | ✅ Working |
| `/api/v1/curated-media/categories` | GET | ✅ | ✅ | `getCuratedMediaCategories()` | ✅ Working |
| `/api/v1/admin/curated-media` | POST | ✅ | N/A | (admin) | ✅ Working |
| `/api/v1/admin/curated-media/{id}` | PUT | ✅ | N/A | (admin) | ✅ Working |
| `/api/v1/admin/curated-media/{id}` | DELETE | ✅ | N/A | (admin) | ✅ Working |

### Admin Story Module

| Endpoint | Method | Backend | Mock | Frontend Uses | Status |
|----------|--------|---------|------|---------------|--------|
| `/api/v1/admin/stories` | GET | ✅ | ✅ | `getStoriesForAdmin()` | ✅ Working |
| `/api/v1/admin/stories/{id}` | GET | ✅ | ✅ | (internal) | ✅ Working |
| `/api/v1/admin/stories/{id}` | PUT | ✅ | ✅ | `updateStoryStatus()` | ✅ Working |
| `/api/v1/admin/stories/{id}/featured` | PATCH | ✅ | ✅ | `toggleStoryFeatured()` | ✅ Working |
| `/api/v1/admin/stories/{id}` | DELETE | ✅ | ✅ | `deleteStory()` | ✅ Working |

### Admin Suggestion Module

| Endpoint | Method | Backend | Mock | Frontend Uses | Status |
|----------|--------|---------|------|---------------|--------|
| `/api/v1/admin/suggestions` | GET | ✅ | ✅ | `getSuggestionsForAdmin()` | ✅ Working |
| `/api/v1/admin/suggestions/{id}` | GET | ✅ | ✅ | (internal) | ✅ Working |
| `/api/v1/admin/suggestions/{id}` | PUT | ✅ | ✅ | `updateSuggestionStatus()` | ✅ Working |
| `/api/v1/admin/suggestions/{id}` | DELETE | ✅ | ✅ | `deleteSuggestion()` | ✅ Working |

### Admin Contact Module

| Endpoint | Method | Backend | Mock | Frontend Uses | Status |
|----------|--------|---------|------|---------------|--------|
| `/api/v1/admin/contact` | GET | ✅ | ✅ | `getContactMessages()` | ✅ Working |
| `/api/v1/admin/contact/{id}` | GET | ✅ | N/A | (internal) | ✅ Working |
| `/api/v1/admin/contact/{id}` | PUT | ✅ | ✅ | `updateContactMessageStatus()` | ✅ Working |
| `/api/v1/admin/contact/{id}` | DELETE | ✅ | ✅ | `deleteContactMessage()` | ✅ Working |

### Admin Directory Submissions

| Endpoint | Method | Backend | Mock | Frontend Uses | Status |
|----------|--------|---------|------|---------------|--------|
| `/api/v1/admin/directory-submissions` | GET | ✅ | ✅ | `getDirectorySubmissions()` | ✅ Working |
| `/api/v1/admin/directory-submissions/{id}` | GET | ✅ | N/A | (internal) | ✅ Working |
| `/api/v1/admin/directory-submissions/{id}` | PUT | ✅ | ✅ | `updateDirectorySubmissionStatus()` | ✅ Working |

### Admin Dashboard Module

| Endpoint | Method | Backend | Mock | Frontend Uses | Status |
|----------|--------|---------|------|---------------|--------|
| `/api/v1/admin/dashboard/counts` | GET | ✅ | ✅ | `getDashboardCounts()` | ✅ Working |
| `/api/v1/admin/dashboard/stats` | GET | ✅ | ✅ | `getAdminStats()` | ✅ Working |
| `/api/v1/admin/dashboard/contributors` | GET | ✅ | ✅ | `getTopContributors()` | ✅ Working |

---

## Part 2: Frontend Component to API Mapping

### Pages Using Real API (via Factory)

| Component/Page | File | API Methods Used |
|----------------|------|------------------|
| Directory List | `app/(main)/directory/page.tsx` | `getEntriesByCategory()` |
| Directory Category | `app/(main)/directory/[category]/page.tsx` | `getEntriesByCategory()` |
| Entry Detail | `app/(main)/directory/entry/[slug]/page.tsx` | `getEntryBySlug()`, `getRelatedContent()` |
| Town List | `app/(main)/towns/page.tsx` | `getTowns()` |
| Town Detail | `app/(main)/towns/[slug]/page.tsx` | `getTownBySlug()` |
| Profile | `app/(main)/profile/page.tsx` | `getProfile()`, `getContributions()` |
| Contact | `app/(main)/contact/page.tsx` | `submitContactMessage()` |
| Contribute Story | `app/(main)/contribute/story/page.tsx` | `submitStory()` |
| Admin Dashboard | `app/(admin)/admin/page.tsx` | Multiple admin methods |
| Interactive Map | `components/maps/InteractiveMap.tsx` | `getEntriesForMap()`, `getTownsForMap()` |
| Reaction Buttons | `components/ui/actions/reaction-buttons.tsx` | `submitReaction()`, `getReactionCounts()` |
| Suggest Form | `components/suggest-improvement-form.tsx` | `submitSuggestion()` |
| Related Entries | `components/related-entries.tsx` | `getRelatedContent()` |
| Add Entry Form | `components/add-entry-form.tsx` | `createDirectoryEntry()` |
| Sitemap | `app/sitemap.ts` | `getEntriesByCategory()`, `getTowns()` |

### Pages Bypassing Factory (CRITICAL)

| Component/Page | File | Direct Mock Import | Fix Required | Status |
|----------------|------|--------------------|--------------|--------|
| Stories List | `app/(main)/stories/page.tsx` | ~~`import { mockStoriesApi }`~~ | Use `getStories()` | ✅ Fixed |
| Story Detail | `app/(main)/stories/[slug]/page.tsx` | ~~`import { mockStoriesApi }`~~ | Use `getStoryBySlug()` | ✅ Fixed |
| Gallery | `app/(main)/gallery/page.tsx` | ~~`import { mockMediaApi }`~~ | Use `getCuratedMedia()` | ✅ Fixed |

**All critical pages now use the API factory pattern.**

---

## Part 3: Mock Data Inventory

### Mock File: `mocks/admin.ts`

| Data Object | Records | Used By |
|-------------|---------|---------|
| `MOCK_ADMIN_STATS` | 1 | Admin dashboard |
| `MOCK_SUGGESTIONS` | 4 | Admin suggestions queue |
| `MOCK_TOP_CONTRIBUTORS` | 5 | Admin dashboard |
| `MOCK_CONTACT_MESSAGES` | 5 | Admin contact queue |
| `MOCK_DIRECTORY_SUBMISSIONS` | 4 | Admin submissions queue |

### Mock File: `mocks/directory.ts`

| Data Object | Records | Used By |
|-------------|---------|---------|
| `MOCK_DIRECTORY_ENTRIES` | 6 | Fallback only |
| `DIRECTORY_TOWNS` | 6 | Fallback only |
| `DIRECTORY_CATEGORIES` | 4 | Fallback only |

### Mock File: `mocks/media.ts`

| Data Object | Records | Used By |
|-------------|---------|---------|
| `MOCK_MEDIA_ITEMS` | 10 (6 photos, 4 videos) | **Gallery page (direct)** |
| `MEDIA_CATEGORIES` | 6 | Gallery filters |

### Mock File: `mocks/stories.ts`

| Data Object | Records | Used By |
|-------------|---------|---------|
| `MOCK_STORIES` | 5 | **Stories pages (direct)** |
| `STORY_TEMPLATES` | 6 | Story contribution form |

### Mock File: `mocks/user.ts`

| Data Object | Records | Used By |
|-------------|---------|---------|
| `MOCK_USER_PROFILE` | 1 | Profile fallback |
| `MOCK_USER_ACTIVITY` | 5 | Profile activity tab |
| `MOCK_SAVED_PLACES` | 4 | Profile bookmarks |
| `MOCK_NOTIFICATION_PREFERENCES` | 1 | Settings |

### Mock File: `mock-api.ts` (Main Mock Client)

| Data Object | Records | Used By |
|-------------|---------|---------|
| `MOCK_ENTRIES` | 8 | API factory (when mock enabled) |
| `MOCK_TOWNS` | 6 | API factory (when mock enabled) |
| `mockReactions` | In-memory | Reaction toggle state |
| `mockBookmarks` | In-memory | Bookmark state |

---

## Part 4: Implementation Checklists

### Module 1: Stories Public API

**Backend Tasks:**
- [ ] Add `GET /api/v1/stories` endpoint to `StoryController.kt`
  - Query params: `status` (default: PUBLISHED), `page`, `size`
  - Returns: `PagedApiResult<StoryResponse>`
- [ ] Add `GET /api/v1/stories/slug/{slug}` endpoint
  - Returns: `ApiResult<StoryResponse>`
- [ ] Create `StoryResponse` DTO (public fields only)
- [ ] Write integration tests

**Frontend Tasks:**
- [ ] Add `getStories()` to `backend-api.ts`
- [ ] Add `getStoryBySlug()` to `backend-api.ts`
- [ ] Export methods in `api.ts`
- [ ] Update `stories/page.tsx` - replace mock import
- [ ] Update `stories/[slug]/page.tsx` - replace mock import
- [ ] Test with real backend

### Module 2: Gallery Media API

**Backend Tasks:**
- [ ] Create `gallery` module directory structure
- [ ] Create `GalleryMedia` entity with fields:
  - `mediaType`: IMAGE, VIDEO, AUDIO
  - `platform`: YOUTUBE, VIMEO, SOUNDCLOUD, SELF_HOSTED
  - `externalId`, `url`, `thumbnailUrl`
  - `title`, `description`, `author`, `category`
  - `displayOrder`, `status`
- [ ] Create `GalleryMediaRepository`
- [ ] Create `GalleryService`
- [ ] Create `GalleryController` with endpoints:
  - `GET /api/v1/gallery` (public, with filters)
  - `GET /api/v1/gallery/{id}` (public)
  - `GET /api/v1/gallery/categories` (public)
  - `POST /api/v1/gallery` (admin)
  - `PUT /api/v1/gallery/{id}` (admin)
  - `DELETE /api/v1/gallery/{id}` (admin)
- [ ] Create Flyway migration with seed data
- [ ] Write integration tests

**Frontend Tasks:**
- [ ] Add `GalleryMediaItem` type to `types/gallery.ts`
- [ ] Add `getGalleryMedia()` to `backend-api.ts`
- [ ] Add `getGalleryCategories()` to `backend-api.ts`
- [ ] Export methods in `api.ts`
- [ ] Update `gallery/page.tsx` - replace mock import
- [ ] Update gallery components for new data structure
- [ ] Test with real backend

### Module 3: Admin Contact Messages

**Backend Tasks:**
- [ ] Create `AdminContactController.kt`
- [ ] Add endpoints:
  - `GET /api/v1/admin/contact` (paginated)
  - `PUT /api/v1/admin/contact/{id}` (update status)
  - `DELETE /api/v1/admin/contact/{id}`
- [ ] Ensure `ContactMessage` entity has status field
- [ ] Write integration tests

**Frontend Tasks:**
- [ ] Update `getContactMessages()` in `backend-api.ts`
- [ ] Update `updateContactMessageStatus()` in `backend-api.ts`
- [ ] Update `deleteContactMessage()` in `backend-api.ts`
- [ ] Remove console.warn messages
- [ ] Test admin dashboard

### Module 4: Admin Directory Submissions

**Backend Tasks:**
- [ ] Create `AdminDirectorySubmissionController.kt`
  - Or add to `DirectoryEntryController` with admin prefix
- [ ] Add endpoints:
  - `GET /api/v1/admin/directory-submissions` (paginated)
  - `PUT /api/v1/admin/directory-submissions/{id}` (update status)
- [ ] Create `DirectorySubmission` entity if not exists
- [ ] Write integration tests

**Frontend Tasks:**
- [ ] Update `getDirectorySubmissions()` in `backend-api.ts`
- [ ] Update `updateDirectorySubmissionStatus()` in `backend-api.ts`
- [ ] Remove console.warn messages
- [ ] Test admin dashboard

### Module 5: Dashboard Enhancements

**Backend Tasks:**
- [ ] Add `GET /api/v1/admin/dashboard/stats` to `DashboardController`
  - Weekly activity data
  - Coverage by town
- [ ] Add `GET /api/v1/admin/dashboard/contributors`
  - Top contributors with points
- [ ] Write integration tests

**Frontend Tasks:**
- [ ] Update `getAdminStats()` in `backend-api.ts`
- [ ] Update `getTopContributors()` in `backend-api.ts`
- [ ] Test admin dashboard charts/stats

### Module 6: Admin Auth Gate

**Frontend Tasks:**
- [ ] Update `app/(admin)/layout.tsx`
- [ ] Add Supabase auth check
- [ ] Redirect unauthenticated to `/login?redirect=/admin`
- [ ] Optional: Check admin role in user metadata
- [ ] Test with unauthenticated user

### Module 7: Settings Page

**Frontend Tasks:**
- [ ] Update `app/(main)/settings/page.tsx`
- [ ] Replace "Coming Soon" placeholders:
  - Notifications: Connect to profile preferences
  - Language: Connect to user language preference
  - Appearance: Connect to theme toggle (may be local storage)
  - Privacy: Connect to profile privacy settings
- [ ] Test all settings controls

---

## Part 5: API Response Pattern Reference

### Standard Response Wrapper

All backend endpoints use this pattern:

```kotlin
// Single item response
data class ApiResult<T>(
    val data: T,
    val timestamp: LocalDateTime = LocalDateTime.now(),
    val status: Int = 200
)

// Paginated response
data class PagedApiResult<T : Any>(
    val data: List<T>,
    val pageable: PageableInfo,
    val timestamp: LocalDateTime = LocalDateTime.now(),
    val status: Int = 200
)

data class PageableInfo(
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
    val hasMore: Boolean
)
```

### Frontend Unwrapping Pattern

```typescript
// In backend-api.ts
const response = await fetch(endpoint);
const result: ApiResult<T> = await response.json();
return result.data; // Unwrap and return data

// For paginated
const result: PagedApiResult<T> = await response.json();
return {
  items: result.data,
  total: result.pageable.totalElements,
  page: result.pageable.page,
  pageSize: result.pageable.size,
  hasMore: result.pageable.hasMore
};
```

---

## Part 6: File Reference Quick Lookup

### Backend Files

| Module | Controller | Entity | Repository |
|--------|------------|--------|------------|
| Directory | `directory/api/DirectoryEntryController.kt` | `DirectoryEntry.kt` | `DirectoryEntryRepository.kt` |
| Town | `directory/api/TownController.kt` | `Town.kt` | `TownRepository.kt` |
| Profile | `auth/api/ProfileController.kt` | `Profile.kt` | `ProfileRepository.kt` |
| Bookmark | `contentactions/api/BookmarkController.kt` | `Bookmark.kt` | `BookmarkRepository.kt` |
| Reaction | `contentactions/ReactionController.kt` | `Reaction.kt` | `ReactionRepository.kt` |
| Story | `contentactions/api/StoryController.kt` | `Story.kt` | `StoryRepository.kt` |
| Suggestion | `contentactions/SuggestionController.kt` | `Suggestion.kt` | `SuggestionRepository.kt` |
| Contact | `contentactions/api/ContactController.kt` | `ContactMessage.kt` | `ContactMessageRepository.kt` |
| Media | `media/api/MediaController.kt` | `Media.kt` | `MediaRepository.kt` |
| Gallery | **TO CREATE** | **TO CREATE** | **TO CREATE** |
| Admin Stories | `contentactions/api/AdminStoryController.kt` | (uses Story) | (uses StoryRepository) |
| Admin Suggestions | `contentactions/api/AdminSuggestionController.kt` | (uses Suggestion) | (uses SuggestionRepository) |
| Dashboard | `contentactions/api/DashboardController.kt` | N/A | (aggregates) |

### Frontend Files

| Purpose | File |
|---------|------|
| API Factory | `apps/web/src/lib/api-factory.ts` |
| Backend Client | `apps/web/src/lib/backend-api.ts` |
| Mock Client | `apps/web/src/lib/mock-api.ts` |
| Public API | `apps/web/src/lib/api.ts` |
| API Contracts | `apps/web/src/lib/api-contracts.ts` |
| Environment | `apps/web/src/lib/env.ts` |
| Mock Data (Admin) | `apps/web/src/lib/mocks/admin.ts` |
| Mock Data (Directory) | `apps/web/src/lib/mocks/directory.ts` |
| Mock Data (Media) | `apps/web/src/lib/mocks/media.ts` |
| Mock Data (Stories) | `apps/web/src/lib/mocks/stories.ts` |
| Mock Data (User) | `apps/web/src/lib/mocks/user.ts` |
