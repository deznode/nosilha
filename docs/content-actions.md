# Content Action Section Pattern

This document provides comprehensive guidance for working with the Content Action Section feature in the Nos Ilha platform. This feature enables cultural heritage engagement through sharing, reactions, and community contributions.

## Overview

The Content Action Section provides cultural heritage engagement features for sharing, reacting, and contributing to heritage content.

## Architecture

- **Location**: `apps/web/src/components/content-actions/`
- **Backend API**: `/api/v1/reactions`, `/api/v1/suggestions`, `/api/v1/directory/entries/{id}/related`
- **Database**: PostgreSQL tables (`reactions`, `suggestions`)
- **Authentication**: Supabase Auth with JWT validation (reactions only)
- **Caching**: ISR with 5-minute revalidation for counts and related content

## Core Components

### 1. ContentActionToolbar (`ContentActionToolbar.tsx`)
- ARIA toolbar pattern for accessibility (role="toolbar")
- Hybrid placement: fixed left rail (desktop lg+), horizontal in-flow (mobile/tablet)
- Integrates all action buttons with proper keyboard navigation
- File: `apps/web/src/components/content-actions/ContentActionToolbar.tsx`

### 2. ShareButton (`ShareButton.tsx`)
- Web Share API with clipboard fallback
- Native share dialog on supported devices
- Copy link confirmation with visual feedback (2-second CheckIcon)
- ARIA live region for screen reader announcements
- File: `apps/web/src/components/content-actions/ShareButton.tsx`

### 3. ReactionButton (`ReactionButton.tsx`)
- Authenticated user reactions (❤️ Love, 👍 Helpful, 🤔 Interesting, 🙏 Thank You)
- Optimistic UI updates with rollback on error
- Public reaction counts for all users
- Rate limiting: 10 reactions/minute per user
- File: `apps/web/src/components/content-actions/ReactionButton.tsx`

### 4. SuggestImprovementForm (`SuggestImprovementForm.tsx`)
- Community contribution modal form
- Three suggestion types: CORRECTION, ADDITION, FEEDBACK
- Honeypot spam protection
- Rate limiting: 5 submissions/hour per IP
- File: `apps/web/src/components/content-actions/SuggestImprovementForm.tsx`

### 5. PrintButton (`print-button.tsx`)
- Browser-native print dialog (window.print())
- Print stylesheet for clean layout
- Citation URL in footer
- File: `apps/web/src/components/ui/print-button.tsx`
- Stylesheet: `apps/web/src/styles/print.css`

### 6. RelatedContent (`RelatedContent.tsx`)
- Content discovery algorithm (category + town + cuisine matching)
- Responsive layout: horizontal scroll (mobile), 2-col (tablet), 3-col (desktop)
- Displays 3-5 related heritage items
- File: `apps/web/src/components/content-actions/RelatedContent.tsx`

## Backend Services

Located in `apps/api/src/main/kotlin/com/nosilha/core/`:

- **ReactionService**: Business logic with rate limiting
- **ReactionController**: REST API endpoints (POST, DELETE, GET)
- **SuggestionService**: Email notifications and spam protection
- **SuggestionController**: Public submission endpoint
- **RelatedContentService**: Three-tier relevance algorithm
- **RelatedContentController**: Content discovery endpoint

## API Endpoints

```
POST   /api/v1/reactions                    - Submit reaction (auth required)
DELETE /api/v1/reactions/content/{id}       - Remove reaction (auth required)
GET    /api/v1/reactions/content/{id}       - Get reaction counts (public)
POST   /api/v1/suggestions                  - Submit suggestion (public)
GET    /api/v1/directory/entries/{id}/related?limit=5 - Get related content (public)
```

## Usage Example

```tsx
import { ContentActionToolbar } from '@/components/content-actions/ContentActionToolbar';

// In heritage page component
<ContentActionToolbar
  contentId={entry.id}
  title={entry.name}
  description={entry.description}
  image={entry.imageUrl || undefined}
/>
```

## Accessibility Features

- WCAG 2.1 AA compliant
- Keyboard navigation (Tab, Arrow keys, Enter, Escape)
- Screen reader support (NVDA, JAWS, VoiceOver)
- 44×44px minimum touch targets on mobile
- Visible focus indicators (3:1 contrast minimum)
- ARIA live regions for dynamic content announcements

## Performance

- Bundle size: <15KB per page (verified)
- ISR caching: 5-minute revalidation
- Optimistic UI for instant feedback
- First Input Delay target: <100ms
- Time to Interactive target: <3s on 3G

## Testing

- Backend integration tests: `ReactionControllerTest.kt`, `SuggestionControllerTest.kt`, `RelatedContentControllerTest.kt`
- Frontend E2E tests: `apps/web/tests/e2e/content-actions.spec.ts`
- Accessibility tests: `apps/web/tests/e2e/accessibility.spec.ts`

## Documentation

- Feature spec: `plan/specs/004-content-action-section/spec.md`
- Implementation plan: `plan/specs/004-content-action-section/plan.md`
- API contracts: `plan/specs/004-content-action-section/contracts/`
- Developer quickstart: `plan/specs/004-content-action-section/quickstart.md`
