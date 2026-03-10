# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-03-10

### Added

- **YouTube channel sync** — RestClient-based YouTube Data API integration with batch deduplication, privacy filtering, runtime configuration management via admin UI, and integration tests (#95)
- **Instagram feed** — Dynamic bento-grid Instagram feed component with dynamic OG image generation for social sharing (#93)
- **AI review queue improvements** — Server-side moderation status filtering, pagination, status badges, media rejection dialog, and optimized AI status queries (#96)
- **Admin EXIF re-extraction** — Complete admin workflow for re-extracting EXIF metadata from gallery media (#90)
- **Gemini prompt enrichment** — Gallery metadata and quality rules injected into AI image analysis prompts
- **Media categories** — Category selector for gallery contributions with refined media category handling and form validation
- **App icon refresh** — Optimized app icon with centering and platform-specific assets

### Fixed

- Stop YouTube video playback when navigating away from gallery (Activity/cacheComponents media cleanup)
- Production audit issues — CSP headers, hydration mismatches, charts, and YouTube CDN allowlisting
- YouTube sync 503 response handling and missing tests
- Disable image optimization for Instagram CDN URLs to prevent fetch failures
- Preserve ISR cache in Docker and warm homepage after deploy
- Keyboard focus indicators and redundant alt text in Instagram feed
- Scope ajv pnpm override to avoid breaking ESLint
- Trivy-action updated to 0.34.2 to resolve CI 404 failure
- Lightbox thumbnail display
- Revalidation path correction
- Spring Modulith docs output path references
- ktlint violations in gallery module

### Changed

- Replace husky with lefthook for git hooks
- Consolidate database migrations into domain-organized modules
- Consolidate category-to-icon mapping into shared utility
- Simplify YouTube sync code architecture with extracted video ID resolution
- Consolidate content skills into unified pipeline
- Design review fixes and responsive improvements
- Upgrade to Node 24 and pnpm 10.31.0

### Security

- Audit and cleanup secret manager configuration
- Add gitleaks allowlist for known false positives

## [1.0.0] - 2026-03-03

First public release of Nos Ilha — a community-driven cultural heritage hub for Brava Island, Cape Verde.

### Added

- **Full-stack foundation** — Next.js 16 (App Router) frontend with React 19, Spring Boot 4 backend with Kotlin 2.3, PostgreSQL database
- **Directory module** — Interactive directory of cultural sites, restaurants, hotels, beaches, and heritage landmarks with full CRUD and slug-based routing
- **Interactive map** — Mapbox GL JS integration with category filtering, custom markers, trail overlays, and mobile-first location discovery
- **Authentication** — Supabase Auth with JWT token validation, role-based access control, and protected admin routes
- **CI/CD pipeline** — Modular GitHub Actions workflows for backend, frontend, infrastructure, and security scanning with GCP Cloud Run deployment
- **Spring Modulith architecture** — Event-driven modular monolith with enforced module boundaries (places, gallery, auth, engagement, stories, feedback, AI)
- **MDX content platform** — Velite-powered content authoring with multilingual support (EN/PT/KEA/FR), data-driven components, Pagefind search, and content validation
- **Gallery module** — Unified media management with user uploads, curated external content, presigned URL uploads, thumbnail generation, and entry-linked media
- **AI image analysis** — Gemini-powered image analysis and content moderation with provider abstraction, prompt externalization, and admin review queue
- **Admin dashboard** — Sidebar navigation, KPI dashboard, and self-contained queue pages for suggestions, messages, AI review, stories, directory, and gallery management
- **Engagement features** — User reactions, bookmarks, story submissions, contact messages, and community feedback channels
- **Design system** — OKLCH color tokens, Tailwind CSS v4, responsive mobile-first components, and a living design system page

### Fixed

- Resolve production audit issues (CSP headers, hydration mismatches, media optimization)
- Remove `pull_request_target` from PR validation workflow to prevent fork PR privilege escalation
- Update content scripts to use `content/pages/` directory structure
- Correct `.gitignore` entry for `credentials.json`

### Security

- Remove leaked credentials from git history via `git-filter-repo`
- Add `credentials.json` to `.gitignore`
- Update `.gitleaksignore` with rewritten commit SHAs for known false positives
- Security scan passes clean: Trivy (vulnerabilities + IaC) and Gitleaks (secret detection)

### Changed

- Optimize media assets (removed ~46MB unused files, compressed oversized images)
- Remove internal process files and obsolete backup files
- Improve dev setup with Taskfile orchestration (`task setup` bootstraps API, web, and infra)
- Disable Docker Compose auto-detection in production profile
- Add `.sdkmanrc` for Java 25 version pinning

[1.1.0]: https://github.com/deznode/nosilha/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/deznode/nosilha/commits/v1.0.0
