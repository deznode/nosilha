# Frontend-Backend Integration Audit Report

> **Generated:** December 18, 2025
> **Branch:** `refactor-from-ideate`
> **Purpose:** Identify gaps between frontend UI and backend API support

## Executive Summary

This audit analyzes the `refactor-from-ideate` branch changes (7,848 lines across 69 files) to identify gaps between the revamped frontend UI and backend API support. The frontend has been significantly enhanced with new features using mock data that require backend implementation.

**Branch:** `refactor-from-ideate` (2 commits ahead of `main`)
**Key Commits:**
- `dd371b6` - feat: add admin contact messages and directory submissions management
- `773c026` - feat: restore missing features from ideate prototype

---

## Gap Analysis Summary

| Feature Area | Frontend Status | Backend Status | Priority |
|--------------|-----------------|----------------|----------|
| Admin Dashboard | Complete UI | No endpoints | P0 |
| Contact Messages | Complete UI | No endpoints | P0 |
| Directory Submissions | Complete UI | No endpoints | P0 |
| User Profile | Complete UI | No endpoints | P1 |
| Stories Feature | Complete UI | No endpoints | P1 |
| Gallery/Media | Complete UI | Partial (upload only) | P2 |
| User Bookmarks | Complete UI | No endpoints | P2 |

---

## Part 1: Mock Data Inventory

### Mock Files Created
All mock data is centralized in `frontend/src/lib/mocks/`:

| File | Purpose | Data Entities |
|------|---------|---------------|
| `admin.ts` | Admin dashboard data | AdminStats, Suggestions, ContactMessages, DirectorySubmissions, Contributors |
| `stories.ts` | Community stories | StorySubmission, StoryTemplates |
| `media.ts` | Gallery content | MediaItem (photos/videos) |
| `user.ts` | User profile data | UserProfile, UserActivity, SavedPlaces, NotificationPreferences |
| `directory.ts` | Enhanced directory | DirectoryEntry with filtering |
| `index.ts` | Mock API router | Exports all mock APIs |

### Type Definitions
Located in `frontend/src/types/`:
- `admin.ts` - Admin queue types, submission statuses
- `story.ts` - Story submission and template types
- `media.ts` - Media item and category types
- `user-profile.ts` - User profile and activity types
- `directory.ts` - Enhanced directory entry types

---

## Part 2: Feature-by-Feature Gap Analysis

### 2.1 Admin Dashboard (`/admin`)

**UI Location:** `frontend/src/app/(admin)/admin/page.tsx`

**Components:**
- `components/admin/dashboard/` - KPI cards, activity chart, coverage chart, top contributors
- `components/admin/queues/` - Messages, directory, stories, suggestions queues

**Current State:** Fully functional UI pulling from `mockAdminApi`

**Required Backend Endpoints:**

```
# Dashboard Statistics
GET /api/v1/admin/stats
Response: {
  newSuggestions: number
  storySubmissions: number
  contactInquiries: number
  directorySubmissions: number
  activeUsers: number
  locationsCovered: number
  weeklyActivity: WeeklyActivityData[]
  coverageByTown: TownCoverageData[]
}

# Top Contributors
GET /api/v1/admin/contributors/top?limit=5
Response: Contributor[]
```

**Architecture Options:**
- **Option A (Existing Pattern):** Add `AdminModule` to Spring Modulith with dedicated service aggregating stats from other modules
- **Option B (Alternative):** Create read-only view/materialized view in PostgreSQL for dashboard metrics, updated via triggers

---

### 2.2 Contact Messages Management

**UI Location:** `components/admin/queues/messages-queue.tsx`

**Current State:** UI complete, no backend

**Required Backend Endpoints:**

```
# Public submission
POST /api/v1/contact
Request: { name, email, subject, message }
Response: { id, status: "UNREAD", timestamp }

# Admin management
GET /api/v1/admin/contact-messages?status={UNREAD|READ|REPLIED|ALL}&page=1&size=20
Response: PagedApiResponse<ContactMessage>

PATCH /api/v1/admin/contact-messages/{id}/status
Request: { status: "READ" | "REPLIED" }
Response: ContactMessage

DELETE /api/v1/admin/contact-messages/{id}
Response: 204 No Content
```

**Data Model:**
```typescript
ContactMessage {
  id: UUID
  name: string
  email: string
  subject: string
  message: string
  status: "UNREAD" | "READ" | "REPLIED"
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Architecture Options:**
- **Option A (Existing Pattern):** New `ContactModule` in Spring Modulith with `ContactMessage` entity
- **Option B (Alternative):** Add to existing `SuggestionModule` as related feedback mechanism

---

### 2.3 Directory Submissions (Community Contributions)

**UI Location:**
- `components/admin/queues/directory-queue.tsx` (admin review)
- `components/directory/add-directory-entry-form.tsx` (submission form)

**Current State:** Full submission form with AI-assisted content, admin review UI complete

**Required Backend Endpoints:**

```
# Public submission
POST /api/v1/directory/submissions
Request: {
  name, category, town, customTown?,
  description, tags[], imageUrl?,
  priceLevel?, latitude?, longitude?,
  submittedBy, submittedByEmail?
}
Response: DirectorySubmission with status: "PENDING"

# Admin management
GET /api/v1/admin/directory-submissions?status={PENDING|APPROVED|REJECTED|ALL}&page=1&size=20
Response: PagedApiResponse<DirectorySubmission>

GET /api/v1/admin/directory-submissions/{id}
Response: DirectorySubmission

PATCH /api/v1/admin/directory-submissions/{id}/review
Request: { status: "APPROVED" | "REJECTED", adminNotes? }
Response: DirectorySubmission
# Note: APPROVED creates DirectoryEntry automatically
```

**Data Model:**
```typescript
DirectorySubmission {
  id: UUID
  name: string
  category: "Restaurant" | "Landmark" | "Nature" | "Culture"
  town: string
  customTown?: string
  description: string
  tags: string[]
  imageUrl?: string
  priceLevel?: "$" | "$$" | "$$$"
  latitude?: number
  longitude?: number
  status: "PENDING" | "APPROVED" | "REJECTED"
  submittedBy: string
  submittedByEmail?: string
  submittedAt: timestamp
  adminNotes?: string
  reviewedBy?: UUID (admin user)
  reviewedAt?: timestamp
}
```

**Architecture Options:**
- **Option A (Existing Pattern):** Add `DirectorySubmission` entity to `DirectoryModule`, use event-driven approach to create `DirectoryEntry` on approval
- **Option B (Alternative):** Separate `ContributionModule` handling all user submissions (directory, stories) with approval workflows

---

### 2.4 Suggestions Management (Admin View)

**UI Location:** `components/admin/queues/suggestions-queue.tsx`

**Current State:** Submit endpoint exists (`POST /api/v1/suggestions`), but no admin retrieval/management

**Required Backend Endpoints:**

```
# Admin management (missing)
GET /api/v1/admin/suggestions?status={PENDING|APPROVED|REJECTED|ALL}&page=1&size=20
Response: PagedApiResponse<Suggestion>

PATCH /api/v1/admin/suggestions/{id}/review
Request: { status: "APPROVED" | "REJECTED", adminNotes? }
Response: Suggestion
```

**Architecture:** Extend existing `SuggestionModule` with admin endpoints

---

### 2.5 User Profile

**UI Location:** `frontend/src/app/(main)/profile/page.tsx`

**Components:**
- `components/profile/profile-header.tsx`
- `components/profile/activity-tab.tsx`
- `components/profile/saved-places-tab.tsx`
- `components/profile/settings-tab.tsx`

**Current State:** Complete profile UI with activity tracking, bookmarks, settings

**Required Backend Endpoints:**

```
# Profile
GET /api/v1/users/me/profile
Response: UserProfile

PATCH /api/v1/users/me/profile
Request: { displayName?, location?, bio?, preferredLanguage? }
Response: UserProfile

# Activity
GET /api/v1/users/me/activity?type={story|suggestion|reaction}&page=1&size=20
Response: PagedApiResponse<UserActivityItem>

# Bookmarks/Saved Places
GET /api/v1/users/me/saved-places
Response: SavedPlace[]

POST /api/v1/users/me/saved-places
Request: { entryId: UUID }
Response: SavedPlace

DELETE /api/v1/users/me/saved-places/{id}
Response: 204 No Content

# Notification Preferences
GET /api/v1/users/me/notification-preferences
Response: UserNotificationPreferences

PATCH /api/v1/users/me/notification-preferences
Request: Partial<UserNotificationPreferences>
Response: UserNotificationPreferences
```

**Data Models:**
```typescript
UserProfile {
  id: UUID
  displayName: string
  email: string
  location?: string
  joinedDate: timestamp
  preferredLanguage: "EN" | "PT" | "KEA"
  avatarUrl?: string
  bio?: string
  stats: {
    storiesSubmitted: number
    suggestionsMade: number
    reactionsGiven: number
    bookmarksCount: number
  }
}

UserActivityItem {
  id: UUID
  type: "story" | "suggestion" | "reaction"
  title: string
  status: "APPROVED" | "PENDING" | "REJECTED"
  timestamp: string
  targetUrl?: string
}

SavedPlace {
  id: UUID
  entryId: UUID
  name: string
  category: string
  town: string
  imageUrl?: string
  savedAt: timestamp
}

UserNotificationPreferences {
  storyPublished: boolean
  suggestionApproved: boolean
  weeklyDigest: boolean
}
```

**Architecture Options:**
- **Option A (Existing Pattern):** New `UserModule` in Spring Modulith, leveraging Supabase user data with extended profile in PostgreSQL
- **Option B (Alternative):** Store profile extensions directly in Supabase using custom claims or profiles table

---

### 2.6 Stories Feature (New)

**UI Location:**
- `frontend/src/app/(main)/stories/page.tsx` (listing)
- `frontend/src/app/(main)/stories/[slug]/page.tsx` (detail)
- `frontend/src/app/(main)/contribute/story/page.tsx` (submission)

**Components:**
- `components/stories/story-card.tsx`
- `components/stories/story-detail-content.tsx`
- `components/story-submission/` (multi-step form)

**Current State:** Complete story submission flow with 4 story types, admin review queue

**Required Backend Endpoints:**

```
# Public
GET /api/v1/stories?location={town}&type={StoryType}&page=1&size=20
Response: PagedApiResponse<StorySubmission> (APPROVED only)

GET /api/v1/stories/{id}
Response: StorySubmission

GET /api/v1/stories/slug/{slug}
Response: StorySubmission

GET /api/v1/stories/{id}/related?limit=3
Response: StorySubmission[]

GET /api/v1/stories/templates
Response: Record<StoryTemplate, { name, description, prompts[] }>

# User submission
POST /api/v1/stories
Request: {
  title, content, author, authorId?,
  type: StoryType, location?, imageUrl?,
  templateType?: StoryTemplate
}
Response: StorySubmission with status: "PENDING"

# Admin
GET /api/v1/admin/stories?status={PENDING|APPROVED|REJECTED|ALL}&page=1&size=20
Response: PagedApiResponse<StorySubmission>

PATCH /api/v1/admin/stories/{id}/review
Request: { status: "APPROVED" | "REJECTED", adminNotes? }
Response: StorySubmission
```

**Data Model:**
```typescript
StorySubmission {
  id: UUID
  slug: string (generated)
  title: string
  content: string
  author: string
  authorId?: UUID
  type: "Quick Memory" | "Full Story" | "Guided Template" | "Photo Moment"
  status: "PENDING" | "APPROVED" | "REJECTED"
  submittedAt: timestamp
  location?: string
  imageUrl?: string
  templateType?: "narrative" | "recipe" | "migration" | "childhood" | "family" | "traditions"
  adminNotes?: string
  reviewedBy?: UUID
  reviewedAt?: timestamp
}
```

**Architecture Options:**
- **Option A (New Module):** Create `StoryModule` in Spring Modulith with `Story` entity
- **Option B (Alternative):** Consider stories as a type of `Content` with shared base entity pattern

---

### 2.7 Gallery/Media Feature

**UI Location:** `frontend/src/app/(main)/gallery/page.tsx`

**Components:**
- `components/gallery/photo-grid.tsx`
- `components/gallery/video-section.tsx`
- `components/gallery/lightbox.tsx`

**Current State:** Gallery UI with category filtering, lightbox viewer

**Existing Backend:** `POST /api/v1/media/upload` exists (file upload to GCS)

**Required Backend Endpoints:**

```
# Public
GET /api/v1/media/photos?category={MediaCategory}&page=1&size=20
Response: PagedApiResponse<MediaItem>

GET /api/v1/media/videos?category={MediaCategory}&page=1&size=20
Response: PagedApiResponse<MediaItem>

GET /api/v1/media/{id}
Response: MediaItem (currently placeholder)

# Admin
GET /api/v1/admin/media?status={PENDING|APPROVED|REJECTED}&type={IMAGE|VIDEO}&page=1&size=20
Response: PagedApiResponse<MediaItem>

PATCH /api/v1/admin/media/{id}/review
Request: { status: "APPROVED" | "REJECTED", adminNotes? }
Response: MediaItem
```

**Data Model:**
```typescript
MediaItem {
  id: UUID
  type: "IMAGE" | "VIDEO"
  url: string
  thumbnailUrl?: string
  title: string
  description?: string
  category: "Landmark" | "Historical" | "Nature" | "Culture" | "Event" | "Interview"
  date?: string
  author?: string
  authorId?: UUID
  locationId?: UUID
  locationName?: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: timestamp
}
```

**Architecture Options:**
- **Option A (Recommended):** Extend current media upload with `MediaModule`, store metadata in PostgreSQL

---

## Part 3: Common Patterns & Shared Infrastructure

### 3.1 Submission Status Workflow

All user contributions follow a consistent status workflow:

```
PENDING (initial) → APPROVED (published) or REJECTED (declined)
```

**Entities using this pattern:**
- DirectorySubmission
- StorySubmission
- MediaItem
- Suggestion

**Recommendation:** Create shared `SubmissionStatus` enum and `Reviewable` interface/mixin

### 3.2 Admin Authorization

**Current State:** No admin role enforcement

**Required:**
- Add `ROLE_ADMIN` to user roles in Supabase/JWT claims
- Create `@AdminOnly` annotation or use `@PreAuthorize("hasRole('ADMIN')")`
- Protect all `/api/v1/admin/**` endpoints

### 3.3 Pagination Pattern

**Existing Pattern:**
```kotlin
PagedApiResponse<T> {
  data: List<T>
  pagination: {
    page, size, totalElements, totalPages, first, last
  }
}
```

**All new list endpoints should follow this pattern**

### 3.4 Rate Limiting

**Existing:** In-memory rate limiting on suggestions (5/hour per IP)

**Needed for:**
- Contact form submissions
- Story submissions
- Media uploads

---

## Part 4: Implementation Priority & Phases

### Phase 1: Admin Foundation (P0)
1. Contact Message entity + CRUD endpoints
2. Directory Submission entity + workflow
3. Admin statistics aggregation endpoint
4. Admin authorization middleware

**Estimated Endpoints:** 10
**Dependencies:** None

### Phase 2: User Profile (P1)
1. User Profile entity (extends Supabase user)
2. User Activity tracking
3. Saved Places / Bookmarks
4. Notification Preferences

**Estimated Endpoints:** 8
**Dependencies:** Phase 1 (admin can see user data)

### Phase 3: Stories (P1)
1. Story entity + CRUD
2. Story templates endpoint
3. Related stories algorithm
4. Admin story review queue

**Estimated Endpoints:** 8
**Dependencies:** Phase 2 (author tracking)

### Phase 4: Media Enhancement (P2)
1. Media metadata storage in PostgreSQL
2. Media listing with filtering
3. Admin media review queue
4. Integration with existing upload

**Estimated Endpoints:** 5
**Dependencies:** Phase 1

### Phase 5: Suggestion Admin (P2)
1. Admin suggestion listing
2. Suggestion review workflow
3. Integration with existing submit endpoint

**Estimated Endpoints:** 2
**Dependencies:** Phase 1

---

## Part 5: Files to Modify

### Backend (New)
```
backend/src/main/kotlin/com/nosilha/
├── contact/
│   ├── ContactMessage.kt (entity)
│   ├── ContactMessageRepository.kt
│   ├── ContactMessageService.kt
│   └── ContactController.kt
├── submission/
│   ├── DirectorySubmission.kt (entity)
│   ├── DirectorySubmissionRepository.kt
│   ├── DirectorySubmissionService.kt
│   └── DirectorySubmissionController.kt
├── story/
│   ├── Story.kt (entity)
│   ├── StoryRepository.kt
│   ├── StoryService.kt
│   └── StoryController.kt
├── user/
│   ├── UserProfile.kt (entity)
│   ├── UserProfileRepository.kt
│   ├── UserProfileService.kt
│   ├── UserActivityService.kt
│   ├── SavedPlace.kt (entity)
│   ├── SavedPlaceRepository.kt
│   └── UserController.kt
└── admin/
    ├── AdminStatsService.kt
    └── AdminController.kt
```

### Frontend Integration Points
```
frontend/src/lib/
├── api.ts (add new API methods)
├── api-contracts.ts (add type contracts)
└── mocks/ (keep for development fallback)

frontend/src/app/
├── (admin)/admin/page.tsx (switch from mock to real API)
├── (main)/profile/page.tsx (switch from mock to real API)
├── (main)/stories/page.tsx (switch from mock to real API)
└── (main)/gallery/page.tsx (switch from mock to real API)
```

### Database Migrations Needed
```
V14__create_contact_messages.sql
V15__create_directory_submissions.sql
V16__create_stories.sql
V17__create_user_profiles.sql
V18__create_saved_places.sql
V19__create_user_activity.sql
V20__create_media_metadata.sql
```

---

## Appendix: Existing Backend Capabilities

### Already Implemented
- Directory Entry CRUD with STI
- Town management
- Reaction system (LOVE, HELPFUL, etc.)
- Suggestion submission
- Related content discovery
- File upload to GCS
- JWT authentication with Supabase
- Rate limiting (in-memory)
- Comprehensive error handling

### Patterns to Reuse
- `ApiResponse<T>` wrapper
- `PagedApiResponse<T>` pagination
- `@Valid` request validation
- `GlobalExceptionHandler`
- `JwtAuthenticationFilter`
- Spring Modulith module boundaries
