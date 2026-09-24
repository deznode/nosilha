---
paths: apps/web/**
---

# Next.js App Router Development

## Commands

```bash
cd apps/web
pnpm install              # Install dependencies
pnpm run dev             # Start development server with Turbopack
pnpm run build           # Build for production (includes Velite content processing)
pnpm run start           # Start production server
pnpm run lint            # Run ESLint
pnpm build:content && pnpm exec tsc --noEmit   # Type check (Velite first, or ~26 phantom @/.velite errors)
```

From the repo root, `task test:web` runs lint, the Velite build, type check and unit tests in that order.

## Architecture Patterns

- **Route Groups**: parentheses organize routes without affecting URLs: `(archive)`, `(archive-fill)`, `(main)`, `(auth)`, `(admin)`
- **Server Components First**: Prioritizes React Server Components for performance
- **Dynamic Routing**: `/[town]`, `/[town]/[entry]`, `/films/[id]`, `/photographs/[id]`, `/history/[slug]`, `/people/[slug]`; legacy `/directory/[category]/[slug]` is a redirect route
- **Mobile-First Design**: All components are responsive and mobile-optimized
- **Authentication**: Supabase Auth provider with JWT token management
- **Caching Strategy**: `"use cache"` + `cacheLife()` with custom profiles (content, entry, longLived, instagram) and built-in `"max"` for static pages
- **API Integration**: Centralized API client; backend or mock chosen by `NEXT_PUBLIC_USE_MOCK_API`, with no runtime fallback to mock data

## Route Structure

```
apps/web/src/app/
├── (archive)/           # Archive home, [town], [town]/[entry], films, photographs, settlements, stay
├── (archive-fill)/      # Full-bleed pages: map, photographs/[id]
├── (main)/              # about, contact, contribute, history, people, stories, profile, settings, design-system, privacy, terms
├── (auth)/              # login, signup
├── (admin)/             # Admin dashboard and dev tools
├── directory/           # Legacy /directory/* redirect route
├── auth/callback/       # Supabase auth callback
└── api/                 # API routes
```

## Testing

### CI/CD (Automated)

```bash
cd apps/web
pnpm build:content && pnpm exec tsc --noEmit   # Type checking
pnpm run lint                                  # ESLint
pnpm run build                                 # Next.js build
```

### Local Development (Manual)

```bash
pnpm run test:e2e   # Playwright E2E tests (Chromium only, local-only)
pnpm run test:unit  # Vitest unit tests (tests/unit, ~93 files)
```

### Pre-Release Checklist (15-20 min)

- [ ] Run `pnpm run test:e2e` locally
- [ ] Test on mobile device (iOS Safari + Android Chrome)
- [ ] Optional: Lighthouse audit on key pages

## Key Patterns

### Server Component with Cache (Default)

```tsx
// app/(archive)/settlements/page.tsx
import { cacheLife, cacheTag } from "next/cache";

async function cachedSettlements(filter: string | undefined) {
  "use cache";
  cacheLife("content");
  cacheTag("towns");
  const towns = await getTownStatusSummary();
  return <SettlementsContent towns={towns} initialFilter={parseSettlementFilter(filter)} />;
}
```

Arguments to a `"use cache"` function become part of the cache key, so pass primitives.

Custom profiles defined in `next.config.ts`: `content` (1h revalidate), `entry` (30m), `longLived` (2h), `instagram` (30m, 2h expire). Built-in `"max"` (30d) for static pages.

### Client Component (Interactive)

```tsx
'use client'

export function InteractiveMap({ markers }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  // ...
}
```

### Static Pages (Rarely Change)

Use the built-in `"max"` cache profile for pages like about, contact, privacy:

```tsx
export default async function AboutPage() {
  "use cache";
  cacheLife("max");
  // ...
}
```

### Dynamic Routes

`params` is a Promise in Next.js 16; await it:

```tsx
// app/(archive)/[town]/page.tsx
export default async function TownPage({
  params,
}: {
  params: Promise<{ town: string }>
}) {
  const { town } = await params
  // ...
}
```

## Reference

- See `docs/10-product/design-system.md` for comprehensive styling guide
- See `docs/20-architecture/testing.md` for full testing documentation
