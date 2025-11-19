![Nos Ilha wordmark](public/images/og-image.jpg)

# Nos Ilha Frontend

The Nos Ilha frontend is a Next.js 16 / React 19.2 application that powers a cultural heritage hub for Brava Island, Cape Verde. It renders public editorial experiences, interactive maps, and lightweight admin workflows that coordinate with the Spring Boot backend. The UI system follows the brand principles documented in `../docs/DESIGN_SYSTEM.md`, while page-level behavior aligns with the reference architecture in `../docs/ARCHITECTURE.md`.

## Tech Stack

- **Framework:** Next.js 16 (App Router, React Server Components) with React 19.2
- **Styling:** Tailwind CSS v4 semantic tokens, custom CSS animations, Merriweather + Lato fonts
- **State & Data:** TanStack Query 5, Zustand stores, React Hook Form + Zod validation
- **Mapping & Media:** Mapbox GL v3, react-map-gl, Framer Motion animations
- **Auth & API:** Supabase Auth client, strategy-based API factory that switches between Spring Boot REST endpoints and local mock data
- **Tooling:** ESLint flat config, Prettier + Tailwind plugin, Storybook 9 (Next.js Vite), Vitest (local), Playwright (local)

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create a local environment file**
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in the required values (see [Environment](#environment) below). Do not commit personal `.env` files—`.gitignore` already excludes them.
3. **Run the development server**
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000).

The App Router organizes routes under `src/app/(main)` (public experiences), `src/app/(auth)` (Supabase-backed auth pages), and `src/app/(admin)` (content contribution flows). `src/lib/api.ts` exposes API functions that automatically select the appropriate backend based on `NEXT_PUBLIC_USE_MOCK_API`.

## Common Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server with Turbopack |
| `npm run build` / `npm run start` | Build and run the production bundle (used by Docker/Cloud Run) |
| `npm run clean` | Remove `.next`, `playwright-report`, and `test-results` build outputs |
| `npm run lint` / `npm run lint:all` | ESLint + Prettier formatting checks (runs in CI) |
| `npm run format` / `npm run format:check` | Prettier (with Tailwind plugin) |
| `npm run test:unit` | Vitest unit tests for critical stores/hooks (local only) |
| `npm run test:e2e` | Playwright E2E suite (Chromium, local only) |
| `npm run test:e2e:headed` / `npm run test:e2e:debug` | E2E tests with browser UI / debug mode |
| `npm run storybook` / `npm run build-storybook` | Storybook 9 component docs + a11y validation |

## Environment

All required variables are validated in `src/lib/env.ts`. Update `.env.local` with:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080        # Spring Boot backend base URL
NEXT_PUBLIC_USE_MOCK_API=false                   # true to use src/lib/mock-api.ts
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_token    # Mapbox public token
NEXT_PUBLIC_SUPABASE_URL=https://your.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key
```

Additional optional variables are documented in `.env.local.example`. Keep secrets out of the repo; use `npm run clean` before zipping/sharing builds to avoid bundling stale `.next` folders.

## Testing & Quality (Simplified for Solo Maintainer)

**CI/CD (Automated):**
- **TypeScript:** Strict type checking with `npx tsc --noEmit` (runs in CI)
- **ESLint:** Code quality and style enforcement (runs in CI)
- **Next.js Build:** Production build validation (runs in CI)

**Local Development (Manual - NOT in CI):**
- **Unit tests:** Vitest + React Testing Library for critical stores and hooks (`tests/unit/**`). Configure globals in `tests/setup/vitest.setup.tsx`.
- **E2E tests:** Playwright specs (`tests/e2e`, `tests/shared`) cover auth, directory flows, and map interactions. Run locally before major releases using `npm run test:e2e`. Chromium browser only for simplicity.
- **Storybook:** Component documentation + a11y addon for accessibility validation. Run `npm run storybook` to explore components and check accessibility.

**Pre-Release Checklist** (20-30 min before major releases):
1. Run `npm run test:e2e` locally (validates critical user flows)
2. Visual review in Storybook with a11y addon checks
3. Test on mobile device (iOS Safari + Android Chrome)
4. Optional: Manual Lighthouse audit on key pages (config in `lighthouserc.js`)

**Testing Philosophy:** This project uses a TypeScript-first, budget-conscious approach optimized for solo maintainers. CI runs only type checking + linting + build (75% faster than full test suite). E2E and unit tests available locally for pre-release validation. See `../docs/TESTING.md` for details.

## Directory Highlights

- `src/app/` – App Router entries, metadata helpers, robots/sitemap, and API routes (e.g., `/api/health`).
- `src/components/catalyst-ui/` – Brand-aligned primitives (Buttons, Inputs, Layouts) built per `../docs/DESIGN_SYSTEM.md`.
- `src/components/ui/` – Feature composites like `DirectoryCard`, `ContentActionToolbar`, `InteractiveMap`, `NewsletterSignup`, `Footer`, etc.
- `src/lib/` – API clients, env validation, metadata builders, Supabase client, animation tokens.
- `src/stores/` – Zustand stores for auth, filters, and UI state.
- `src/hooks/` – TanStack Query hooks and reusable utilities (`useMediaQuery`, smooth scroll).
- `src/stories/` – Storybook stories for primitives, composites, and route-level sections.
- `tests/` – Playwright E2E tests and Vitest unit tests (local development only, not run in CI).

Refer to `../docs/ARCHITECTURE.md` for a system-level overview (frontend, backend, infrastructure) and to `../docs/DESIGN_SYSTEM.md` for color, typography, and motion guidelines. All code changes should be validated against those documents to maintain brand consistency and architectural integrity.
