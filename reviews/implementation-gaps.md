# Implementation Gap Analysis

**Date**: 2025-12-27
**Source**: Comparison of P0-P4 ideation documents vs 009/010 implementation specs
**Method**: Playwright MCP testing + codebase exploration

---

## Executive Summary

| Category | Status | Count |
|----------|--------|-------|
| Code Gaps (Fix Required) | 🔴 | 3 |
| Configuration Gaps | 🟡 | 1 |
| UI Gaps (Placeholder) | 🟡 | 1 |
| Content Gaps | 🟠 | 2 |
| **Confirmed Working** | ✅ | 10+ |

---

## Priority 1: Code Gaps (Fix Required)

### 1.1 Media Gallery Using Mock Data

**Ideation Reference**: P3.1 Photo Gallery & Upload
**Impact**: High - Core feature not connected to real data
**Detailed Plan**: [gallery-media-integration-plan.md](./gallery-media-integration-plan.md)

#### Current State

- **File**: `apps/web/src/app/(main)/gallery/page.tsx`
- **Lines 11, 28-31**: Imports and uses mock API
- **Mock Data Source**: `apps/web/src/lib/mocks/media.ts` (6 photos, 4 YouTube videos)

#### Analysis & Decision (2025-12-27)

**Problem**: Existing `Media` entity is for R2 file uploads. Gallery needs curated external content (YouTube embeds, external URLs).

**Research**: Analyzed patterns from Shopify Hydrogen, React Chrono, CKEditor. Common pattern: separate `ExternalVideo` entity from uploaded media.

**Decision**: Create new `GalleryMedia` entity (not extend existing `Media`)

| Existing `Media` | New `GalleryMedia` |
|------------------|-------------------|
| User uploads to R2 | Curated external references |
| File storage metadata | URL/embed references |
| UGC moderation workflow | Admin-curated content |

#### New Backend API (To Create)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/gallery` | GET | List gallery items with type/category filters |
| `/api/v1/gallery?type=VIDEO` | GET | Videos only (YouTube embeds) |
| `/api/v1/gallery?type=IMAGE` | GET | Photos only |
| `/api/v1/gallery?type=AUDIO` | GET | Podcasts (future) |
| `/api/v1/gallery/categories` | GET | Available categories |

#### GalleryMedia Entity Fields

```kotlin
mediaType: IMAGE | VIDEO | AUDIO
platform: YOUTUBE | VIMEO | SOUNDCLOUD | SELF_HOSTED
externalId: String?     // YouTube video ID
url: String?            // Self-hosted URL
thumbnailUrl: String?   // Auto-generated for YouTube
title, description, author, category, displayOrder
```

#### Files to Create/Modify

**Backend (New):**
- `apps/api/src/main/kotlin/com/nosilha/core/gallery/domain/GalleryMedia.kt`
- `apps/api/src/main/kotlin/com/nosilha/core/gallery/repository/GalleryMediaRepository.kt`
- `apps/api/src/main/kotlin/com/nosilha/core/gallery/service/GalleryService.kt`
- `apps/api/src/main/kotlin/com/nosilha/core/gallery/api/GalleryController.kt`
- `apps/api/src/main/resources/db/migration/V{next}__create_gallery_media_table.sql`

**Frontend (Modify):**
- `apps/web/src/app/(main)/gallery/page.tsx` - Use real API
- `apps/web/src/lib/backend-api.ts` - Add gallery methods
- `apps/web/src/types/gallery.ts` - New type definitions

See [gallery-media-integration-plan.md](./gallery-media-integration-plan.md) for complete implementation details.

---

### 1.2 Contact Form Disconnected

**Ideation Reference**: P3.4 Contact Form
**Impact**: Medium - User feedback channel broken

#### Current State
- **Console Warning**: "Contact messages API not yet implemented in backend"
- **Warning is INCORRECT** - Backend API exists!

#### Backend API Available
- **Endpoint**: `POST /api/v1/contact`
- **Controller**: `apps/api/src/main/kotlin/com/nosilha/core/contact/ContactController.kt`

#### Files to Check
1. `apps/web/src/app/(main)/contact/page.tsx` - Form submission handler
2. `apps/web/src/lib/backend-api.ts` - Verify `submitContact` method exists

#### Implementation Steps
1. Check if `backendApi.submitContact()` method exists in `backend-api.ts`
2. If missing, add:
```typescript
submitContact: async (data: ContactFormData): Promise<void> => {
  const response = await fetch(`${API_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to submit contact form');
}
```
3. Update contact form to use real API instead of showing warning
4. Remove/update the incorrect console warning

#### Files to Modify
- `apps/web/src/app/(main)/contact/page.tsx`
- `apps/web/src/lib/backend-api.ts` (if method missing)

---

### 1.3 Admin Dashboard No Auth Gate

**Ideation Reference**: P1.1 Admin Moderation Dashboard
**Impact**: High - Security concern (UI renders without authentication)

#### Current State
- **Behavior**: Admin dashboard UI renders fully without authentication
- **Backend**: Correctly returns 500 for unauthenticated API requests
- **Problem**: Users can see admin UI structure, stats panels, and tabs

#### Observed During Testing
- Admin page at `/admin` loads without login
- Shows stats panel (all zeros)
- Tabs visible: Suggestions, Stories, Inquiries, Directory
- Console shows 500 errors from `/api/v1/admin/*` endpoints

#### Implementation Steps
1. Add authentication check to admin layout:

**File**: `apps/web/src/app/(admin)/layout.tsx`
```typescript
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function AdminLayout({ children }) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?redirect=/admin');
  }

  // Optional: Check admin role
  // const isAdmin = session.user.user_metadata?.role === 'admin';
  // if (!isAdmin) redirect('/');

  return <>{children}</>;
}
```

2. Alternatively, add client-side check in individual admin pages

#### Files to Modify
- `apps/web/src/app/(admin)/layout.tsx` - Add auth redirect
- Or individual admin page files in `apps/web/src/app/(admin)/`

---

## Priority 2: Configuration Gaps

### 2.1 Language Switcher Disabled

**Ideation Reference**: P1.3 Language Switcher
**Impact**: Low - Infrastructure ready, just needs enabling

#### Current State
**File**: `apps/web/src/components/ui/header.tsx` (lines 70-74)
```typescript
const languages = [
  { code: "EN", label: "English", flag: "🇺🇸", disabled: false },
  { code: "PT", label: "Português", flag: "🇵🇹", disabled: true },  // ← disabled
  { code: "CV", label: "Kriolu", flag: "🇨🇻", disabled: true },     // ← disabled
];
```

#### Ready Infrastructure
| Component | Status | File |
|-----------|--------|------|
| Translation logic | ✅ Ready | `apps/web/src/lib/content/translations.ts` |
| Velite config | ✅ Ready | `apps/web/velite.config.ts` (supports en, pt, kea, fr) |
| Translation CLI | ✅ Ready | `apps/web/scripts/check-translations.ts` |
| Admin dashboard | ✅ Ready | `apps/web/src/components/content/translation-dashboard.tsx` |
| Fallback chain | ✅ Ready | kea → pt → en |

#### Implementation Steps
1. Create translations for existing content (see Content Gaps below)
2. Change `disabled: true` to `disabled: false` in header.tsx when translations exist

#### Files to Modify
- `apps/web/src/components/ui/header.tsx` (lines 72-73)

---

## Priority 3: UI Gaps

### 3.1 Settings Page Placeholder

**Ideation Reference**: P2.3 User Profile Enhancement
**Impact**: Medium - Users expect functional settings

#### Current State
**File**: `apps/web/src/app/(main)/settings/page.tsx`

All settings sections show "Coming Soon":
- Notifications: Coming Soon
- Language: Coming Soon
- Appearance: Coming Soon
- Privacy: Coming Soon

**Note**: Profile page (`/profile`) IS connected to real API with Activity, Saved Places, Settings tabs

#### Backend API Available
- `ProfileController` with notification preferences
- `GET /api/v1/profile` - Get user profile with preferences
- `PATCH /api/v1/profile` - Update profile preferences

#### Implementation Steps
1. Connect notification settings to profile API
2. Connect language preference to user profile
3. Implement appearance toggle (may be local storage only)
4. Implement privacy settings if backend supports

#### Files to Modify
- `apps/web/src/app/(main)/settings/page.tsx`
- May need: `apps/web/src/lib/backend-api.ts` for settings-specific methods

---

## Priority 4: Content Gaps

### 4.1 Zero Translations

**Ideation Reference**: P1.2 Portuguese Content, P2.1 Kriolu Content
**Impact**: Community engagement limited to English speakers

#### Current State
- **Content Location**: `apps/web/content/pages/`
- **Language Files**: Only `en.mdx` exists (7 articles)
- **Missing**: `pt.mdx` and `kea.mdx` for all articles

#### Existing Articles Needing Translation
```
apps/web/content/pages/
├── music/
│   ├── funana-traditions/en.mdx  ← needs pt.mdx, kea.mdx
│   └── morna-origins/en.mdx      ← needs pt.mdx, kea.mdx
├── people/
│   ├── daddy-grace/en.mdx        ← needs pt.mdx, kea.mdx
│   └── eugenio-tavares/en.mdx    ← needs pt.mdx, kea.mdx
├── traditions/
│   └── batuku/en.mdx             ← needs pt.mdx, kea.mdx
├── history/
│   └── [articles]/en.mdx         ← needs pt.mdx, kea.mdx
└── places/
    └── [articles]/en.mdx         ← needs pt.mdx, kea.mdx
```

#### Process
For each `en.mdx` file:
1. Create `pt.mdx` in same directory (Portuguese translation)
2. Create `kea.mdx` in same directory (Kriolu translation)
3. Maintain same frontmatter structure
4. Run `pnpm check-translations` to verify

---

### 4.2 History Category Content Missing

**Ideation Reference**: P2.2 History Content
**Impact**: Key content category empty

#### Planned Articles (Not Created)
1. `brava-origins` - Origins and founding of Brava
2. `emigration-waves` - Cape Verdean diaspora history
3. `volcanic-heritage` - Geological history
4. `colonial-era` - Colonial period
5. `maritime-traditions` - Seafaring history

#### Process
1. Create directory structure: `apps/web/content/pages/history/[article-slug]/`
2. Create `en.mdx` with proper frontmatter
3. Add translations after English version complete

---

## Confirmed Working (No Gaps)

These features are fully implemented and connected:

| Feature | Backend | Frontend | Verified By |
|---------|---------|----------|-------------|
| Directory Browsing | ✅ Full API | ✅ Connected | 9 entries loaded from `GET /api/v1/directory/entries` |
| Story Submission | ✅ Full API | ✅ 3 types | `POST /api/v1/stories` with JWT auth |
| User Profile | ✅ Full API | ✅ Connected | `GET /api/v1/users/me` with JWT auth |
| Bookmarks | ✅ Full API | ✅ Hooks working | `useBookmarks`, `useToggleBookmark` → real API |
| Reactions | ✅ Full API | ✅ Connected | `POST/DELETE /api/v1/reactions` with rate limiting |
| Directory Search | ✅ Full API | ✅ Hybrid | Backend `?q=` param + client-side `useMemo()` |
| Advanced Filtering | ✅ Params | ✅ Dropdowns | Backend params + client-side filtering |
| Login/Auth | ✅ JWT | ✅ Supabase | Full OAuth + password auth with error handling |
| Profile Auth Gate | N/A | ✅ Working | Shows login prompt on page (not redirect) |
| Settings Auth Gate | N/A | ✅ Working | Shows login prompt on page |

---

## Backend API Reference

### Endpoints Available (55+ total)

#### Profile & User
- `GET /api/v1/profile` - Get user profile
- `PATCH /api/v1/profile` - Update profile
- `GET /api/v1/profile/activity` - Activity history

#### Directory
- `GET /api/v1/directory/entries` - List with filters (q, category, town, sort)
- `GET /api/v1/directory/entries/{id}` - Single entry
- `GET /api/v1/directory/entries/{id}/related` - Related content

#### Bookmarks
- `GET /api/v1/bookmarks` - User's bookmarks
- `POST /api/v1/bookmarks` - Add bookmark
- `DELETE /api/v1/bookmarks/{entryId}` - Remove bookmark
- `GET /api/v1/bookmarks/check/{entryId}` - Check if bookmarked

#### Reactions
- `POST /api/v1/reactions` - Add reaction
- `GET /api/v1/reactions/entry/{id}` - Get entry reactions
- `GET /api/v1/reactions/entry/{id}/user` - Get user's reaction

#### Media
- `POST /api/v1/media/presign` - Get upload URL
- `POST /api/v1/media/confirm` - Confirm upload
- `GET /api/v1/media/entry/{entryId}` - Entry media

#### Stories
- `GET /api/v1/stories` - List stories
- `GET /api/v1/stories/{id}` - Single story
- `POST /api/v1/stories` - Submit story

#### Contact
- `POST /api/v1/contact` - Submit contact message

#### Admin
- `GET /api/v1/admin/suggestions` - Pending suggestions
- `GET /api/v1/admin/stories` - Stories for moderation
- `PATCH /api/v1/admin/stories/{id}/status` - Approve/reject

---

## Implementation Order Recommendation

1. **Admin Auth Gate** (1.3) - Security fix, quick win
2. **Contact Form** (1.2) - Quick fix, API exists
3. **Media Gallery** (1.1) - Requires API design decision
4. **Settings Page** (3.1) - UI polish
5. **Translations** (4.1) - Content creation
6. **History Content** (4.2) - Content creation
7. **Language Switcher** (2.1) - Enable after translations

---

## Testing Verification

After implementing fixes, verify with Playwright MCP:

```bash
# Start both servers
cd apps/api && ./gradlew bootRun --args='--spring.profiles.active=local'
cd apps/web && pnpm run dev

# Test areas
- /gallery - Should load real media from API
- /contact - Form should submit without console warnings
- /admin - Should redirect to login when unauthenticated
- /settings - Should show functional settings when authenticated
```

---

## Related Files Summary

| Gap | Primary Files |
|-----|---------------|
| Media Gallery | `apps/web/src/app/(main)/gallery/page.tsx`, `apps/web/src/lib/backend-api.ts` |
| Contact Form | `apps/web/src/app/(main)/contact/page.tsx`, `apps/web/src/lib/backend-api.ts` |
| Admin Auth | `apps/web/src/app/(admin)/layout.tsx` |
| Language | `apps/web/src/components/ui/header.tsx` |
| Settings | `apps/web/src/app/(main)/settings/page.tsx` |
| Translations | `apps/web/content/pages/**/*.mdx` |
