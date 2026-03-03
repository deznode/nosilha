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
npx tsc --noEmit        # TypeScript type checking
```

## Architecture Patterns

- **Route Groups**: Uses parentheses for logical organization `(auth)`, `(main)`, `(admin)` without affecting URLs
- **Server Components First**: Prioritizes React Server Components for performance
- **Dynamic Routing**: `/directory/[category]`, `/directory/[category]/[slug]`
- **Mobile-First Design**: All components are responsive and mobile-optimized
- **Authentication**: Supabase Auth provider with JWT token management
- **Caching Strategy**: `"use cache"` + `cacheLife()` with custom profiles (content, entry, longLived) and built-in `"max"` for static pages
- **API Integration**: Centralized API client with error handling and fallback to mock data

## Route Structure

```
apps/web/src/app/
├── (auth)/              # Auth routes (login, register)
├── (main)/              # Public routes
│   ├── directory/
│   │   ├── [category]/
│   │   └── [category]/[slug]/
│   └── [category]/      # MDX content pages
├── (admin)/             # Admin dashboard
└── api/                 # API routes
```

## Testing

### CI/CD (Automated)

```bash
cd apps/web && npx tsc --noEmit  # Type checking
pnpm run lint                     # ESLint
pnpm run build                    # Next.js build
```

### Local Development (Manual)

```bash
pnpm run test:e2e   # Playwright E2E tests (Chromium only, local-only)
pnpm run test:unit  # Vitest unit tests (4 critical store/hook tests)
```

### Pre-Release Checklist (15-20 min)

- [ ] Run `pnpm run test:e2e` locally
- [ ] Test on mobile device (iOS Safari + Android Chrome)
- [ ] Optional: Lighthouse audit on key pages

## Key Patterns

### Server Component with Cache (Default)

```tsx
// app/directory/page.tsx
import { cacheLife, cacheTag } from "next/cache";

export default async function DirectoryPage() {
  "use cache";
  cacheLife("content");
  cacheTag("directory");
  const entries = await fetchDirectoryEntries()
  return <DirectoryList entries={entries} />
}
```

Custom profiles defined in `next.config.ts`: `content` (1h revalidate), `entry` (30m), `longLived` (2h). Built-in `"max"` (30d) for static pages.

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

```tsx
// app/directory/[category]/page.tsx
export default async function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params
  // ...
}
```

## Reference

- See `docs/10-product/design-system.md` for comprehensive styling guide
- See `docs/20-architecture/testing.md` for full testing documentation
