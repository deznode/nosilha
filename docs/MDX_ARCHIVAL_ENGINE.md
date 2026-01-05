# MDX Archival Engine - Test Report & Integration Guide

## Overview

The MDX Archival Engine converts approved community stories into permanent MDX files for git-versioned heritage archival. This document summarizes testing results, bugs found and fixed, and provides a complete integration guide.

## Test Summary

| Test Area | Status | Notes |
|-----------|--------|-------|
| Dev server startup | PASSED | Frontend (3000) and Backend (8080) running |
| Admin authentication | PASSED | Supabase Auth JWT flow working |
| Stories queue loading | PASSED | Stories display with correct status badges |
| MDX Archive button visibility | PASSED | Appears for APPROVED status stories |
| MDX generation API | FIXED | Was returning 400 for valid stories |
| MDX commit workflow | READY | Awaiting Gemini API key configuration |

---

## Issues Found & Fixed

### Issue 1: MDX Generation Fails with 400 Error (CRITICAL - FIXED)

**Symptom:** Clicking "MDX Archive" button on stories showing "APPROVED" status returned HTTP 400 error.

**Root Cause:** Status mapping mismatch between frontend and backend.

- **Backend validation** (`AdminMdxController.kt:119-125`): Required status to be exactly `StoryStatus.APPROVED`
- **Frontend mapping** (`backend-api.ts:1165-1172`): Both `APPROVED` and `PUBLISHED` backend statuses display as `APPROVED` in the UI
- **Result:** Stories with `PUBLISHED` backend status appeared as "APPROVED" in UI, but failed MDX generation

**Database Evidence:**
```sql
SELECT id, title, status FROM story_submissions WHERE title LIKE '%Christmas%';
-- Result: ae140be2-... | Test Memory: Christmas Morning... | PUBLISHED
```

**Fix Applied:**

File: `apps/api/src/main/kotlin/com/nosilha/core/stories/api/StoryController.kt`

```kotlin
// Before (line 119-125):
if (story.status != StoryStatus.APPROVED) {
    throw BusinessException("Only approved stories can be archived...")
}

// After:
val archivableStatuses = setOf(StoryStatus.APPROVED, StoryStatus.PUBLISHED)
if (story.status !in archivableStatuses) {
    throw BusinessException("Only approved or published stories can be archived...")
}
```

Same fix applied to `commitMdx` method at lines 201-208.

---

### Issue 2: Status Display Ambiguity (DOCUMENTED)

**Symptom:** UI shows both `APPROVED` and `PUBLISHED` stories as "APPROVED".

**Location:** `apps/web/src/lib/backend-api.ts:1165-1172`

```typescript
private mapBackendStoryStatus(backendStatus: string): SubmissionStatus {
  const statusMap: Record<string, SubmissionStatus> = {
    PENDING: SubmissionStatus.PENDING,
    APPROVED: SubmissionStatus.APPROVED,
    REJECTED: SubmissionStatus.REJECTED,
    NEEDS_REVISION: SubmissionStatus.PENDING,
    PUBLISHED: SubmissionStatus.APPROVED,  // <-- Maps PUBLISHED to APPROVED
  };
  return statusMap[backendStatus] || SubmissionStatus.PENDING;
}
```

**Impact:** Admins cannot distinguish between stories that are:
- Approved (ready for publishing)
- Published (live on the site)

**Recommendation:** Consider adding a `PUBLISHED` status to the frontend `SubmissionStatus` enum for clearer differentiation.

---

## Story Status Workflow

```
PENDING → APPROVED → PUBLISHED → MDX_ARCHIVED
   │         │           │            │
   │         │           │            └─ MDX file committed to git
   │         │           └─ Story live on website
   │         └─ Admin review passed
   └─ Initial submission
```

**MDX Archival is available for:** `APPROVED` or `PUBLISHED` status stories.

---

## Integration Guide

### Prerequisites

1. **Environment Variables** (frontend `.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_api_key  # Required for AI-powered MDX generation
```

2. **GitHub Token** (for commit workflow):
```bash
GITHUB_TOKEN=ghp_xxxxx  # Personal access token with contents:write scope
GITHUB_REPO_OWNER=jcosta
GITHUB_REPO_NAME=nosilha
```

### Publishing a Story (Admin Workflow)

1. **Navigate to Admin Dashboard**
   - URL: `/admin`
   - Requires: ADMIN role authentication

2. **Review Pending Stories**
   - Click "Stories" tab
   - Filter by "Pending" status
   - Click "View Full" to review content

3. **Approve a Story**
   - Click "Publish" button on a pending story
   - Story status changes to `APPROVED`

4. **Archive to MDX**
   - Click "MDX Archive" button (appears for APPROVED/PUBLISHED stories)
   - System generates MDX preview using Gemini AI
   - Review generated frontmatter and content

5. **Commit to GitHub**
   - In the MDX Preview Modal, click "Commit to GitHub Archive"
   - System creates commit via GitHub API
   - Story is archived to `content/stories/{slug}.mdx`

### MDX Generation API

**Endpoint:** `POST /api/v1/admin/stories/{id}/generate-mdx`

**Request:**
```json
{
  "includeTranslations": false,
  "targetLanguage": "en"
}
```

**Response:**
```json
{
  "data": {
    "mdxSource": "---\ntitle: Story Title\nslug: story-slug\n...",
    "frontmatter": { "title": "...", "slug": "...", ... },
    "schemaValid": true,
    "validationErrors": []
  },
  "status": 200
}
```

### MDX Commit API

**Endpoint:** `POST /api/v1/admin/stories/{id}/commit-mdx`

**Request:**
```json
{
  "mdxSource": "---\ntitle: ...\n---\nContent...",
  "commitMessage": "Archive story: Story Title"
}
```

**Response:**
```json
{
  "data": {
    "storyId": "uuid",
    "slug": "story-slug",
    "mdxPath": "content/stories/story-slug.mdx",
    "committedAt": "2026-01-04T15:30:00Z",
    "committedBy": "admin-user-id"
  },
  "status": 201
}
```

---

## Velite Content Schema

The generated MDX files follow the Velite schema defined in `velite.config.ts`:

```typescript
const storySchema = s.object({
  title: s.string().max(255),
  slug: s.string(),
  author: s.string(),
  date: s.isodate(),
  language: s.enum(["en", "pt", "kea"]),
  location: s.string().optional(),
  storyType: s.enum(["quick", "full", "guided"]),
  tags: s.array(s.string()).optional(),
  sourceStoryId: s.string(),
  content: s.mdx(),
});
```

---

## Troubleshooting

### MDX Archive Button Not Showing

**Cause:** Story status is not `APPROVED` or `PUBLISHED`

**Solution:**
1. Check database: `SELECT status FROM story_submissions WHERE id = 'uuid';`
2. Approve the story via admin UI

### 400 Error on MDX Generation

**Cause:** Story status validation failed (now fixed)

**Solution:** Ensure backend has latest code with the fix allowing both `APPROVED` and `PUBLISHED` statuses.

### 403 Error on API Calls

**Cause:** Authentication token expired or invalid

**Solution:**
1. Log out and log back in
2. Clear browser storage and re-authenticate
3. Check Supabase token validity

### GitHub Commit Fails

**Cause:** Missing or invalid `GITHUB_TOKEN`

**Solution:**
1. Generate new Personal Access Token with `contents:write` scope
2. Add to environment variables
3. Restart the application

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Admin UI      │────▶│  Next.js API     │────▶│  Spring Boot    │
│   (React)       │     │  Routes          │     │  Backend        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │  GitHub API      │◀────│  MDX Generation │
                        │  (Octokit)       │     │  Service        │
                        └──────────────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │  content/stories │
                        │  (Git Repo)      │
                        └──────────────────┘
```

---

## Files Modified/Created

| File | Purpose |
|------|---------|
| `apps/api/.../AdminMdxController.kt` | Fixed status validation to accept APPROVED + PUBLISHED |
| `apps/web/velite.config.ts` | Stories collection schema |
| `apps/web/src/components/admin/mdx-preview-modal.tsx` | MDX preview component |
| `apps/web/src/components/admin/queues/stories-queue.tsx` | MDX Archive button integration |
| `apps/web/src/app/actions/archive-story.ts` | Server action for GitHub commit |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-04 | Initial MDX Archival Engine implementation |
| 1.0.1 | 2026-01-04 | Fixed status validation bug (APPROVED + PUBLISHED) |
