# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nos Ilha is a community-driven cultural heritage hub for Brava Island, Cape Verde. This volunteer-supported, open-source project is a full-stack web application that preserves and celebrates the island's rich cultural memory through an interactive directory of cultural sites, landmarks, and local businesses, with mapping functionality.

## Architecture

- **Frontend**: Next.js 16.1 (App Router) with React 19.2, TypeScript, Tailwind CSS, ISR, Supabase Auth
- **Backend**: Spring Boot 4.0.0 with Kotlin 2.3.0, Java 25, Spring Modulith 2.0.1, PostgreSQL
- **Infrastructure**: Docker Compose (local), Terraform + GCP Cloud Run (prod)
- **CI/CD**: 9 GitHub Actions workflows — security scanning, auto-deployment, health checks

## Project Organization

```
nosilha/
├── apps/web/          # Next.js 16.1 frontend
├── apps/api/          # Spring Boot 4 backend (Kotlin)
├── infrastructure/    # Docker Compose, Terraform, GCP config
├── docs/              # Architecture, API reference, ADRs, design system
├── plan/              # Git submodule — specs and planning documents
└── .claude/           # Rules, skills, commands for Claude Code
```

See `docs/architecture.md` for detailed integration flows (auth, content management, media, CI/CD).

## Development Setup

Uses [Taskfile](https://taskfile.dev/) for orchestration. Install: `brew install go-task`

```bash
task check     # verify prerequisites (Docker, Node, pnpm, Java)
task setup     # copy env templates, install web deps
task dev       # start API (auto-starts postgres) + web in parallel
```

**Environment files**: Copy templates before first run:

- `apps/api/src/main/resources/application-local.yml.example` → `application-local.yml`
- `apps/web/.env.local.example` → `.env.local`

Or run `task setup` which handles the web env file automatically.

## Development Commands

For detailed commands by domain, see the modular rules:
- Frontend: @.claude/rules/frontend/app-router.md
- Backend: @.claude/rules/backend/spring-modulith.md
- Content: @.claude/rules/content/mdx-platform.md
- Infrastructure: @.claude/rules/infrastructure/cicd-deployment.md

Additional convention rules auto-load based on file paths (see Modular Rules below).

## Claude Code Memory

Use `/memory` to view and edit all loaded memory files.

### Modular Rules (.claude/rules/)

Domain-specific instructions loaded automatically based on file paths:

| Rule File | Trigger Path | Purpose |
|-----------|-------------|---------|
| `frontend/app-router.md` | `apps/web/**` | Next.js App Router patterns and commands |
| `frontend/design-system.md` | `apps/web/**` | Design system, OKLCH tokens, Tailwind CSS |
| `frontend/state-management.md` | `apps/web/**` | Zustand stores, TanStack Query, Zod schemas |
| `frontend/api-client.md` | `apps/web/**` | API factory, contracts, caching, types |
| `frontend/component-patterns.md` | `apps/web/**` | forwardRef, clsx, toast, loading states |
| `backend/spring-modulith.md` | `apps/api/**` | Module boundaries, events, shared kernel |
| `backend/api-patterns.md` | `apps/api/**` | ApiResult, controllers, module sub-packages |
| `backend/kotlin-conventions.md` | `apps/api/**` | Jackson 3.x, logging, transactions, ktlint |
| `backend/database-patterns.md` | `apps/api/**` | Flyway, entities, JSONB, full-text search |
| `backend/testing-patterns.md` | `apps/api/**` | Integration tests, MockMvc, auth mocking |
| `backend/security-auth.md` | `apps/api/**` | Exceptions, rate limiting, security config |
| `content/mdx-platform.md` | `apps/web/content/**` | MDX content authoring platform |
| `infrastructure/cicd-deployment.md` | `infrastructure/**, .github/**` | CI/CD, Docker, cloud deployment |

## Skills and Commands

The codebase uses a two-part system for specialized capabilities:
- **Skills** (`.claude/skills/`) - Domain experts that execute tasks and write code/content
- **Commands** (`.claude/commands/`) - Slash commands that expand into prompts and trigger workflows

### Project Skills

Domain-specific executors located in `.claude/skills/`. Each skill has detailed documentation in its SKILL.md file.

| Category | Skills |
|----------|--------|
| **Content & Heritage** | `authoring-content`, `planning-content`, `verifying-content` |
| **Infrastructure** | `mapping-sites` |
| **Research** | `web-searching` |
| **Browser Testing** | `playwright:playwright-cli` (Claude Code plugin) |

### Slash Commands

Custom workflow triggers in `.claude/commands/`. Use syntax: `/command-name [arguments]`

**Project**: `/research <topic>` - Conduct cultural/historical research with web search

### Usage Guidelines

- **Skills**: Use for executing tasks (writing code, content, infrastructure changes)
- **Commands**: Use to trigger workflows and specialized operations

### Playwright Verification

Two Playwright capabilities exist — use the right one for the task:

| Tool | When to Use | How |
|------|-------------|-----|
| **`playwright:playwright-cli` skill** | Ad-hoc feature verification — browse pages, click through flows, take screenshots | Invoke via `/playwright-cli` or the skill system |
| **E2E test suite** | Pre-release regression testing — run the full automated test suite | `cd apps/web && pnpm run test:e2e` |

Config: `playwright-cli.json` (project root) configures the CLI skill. `apps/web/playwright.config.ts` configures the test suite.

### Documentation Compliance

- **Frontend work** → Reference `docs/design-system.md`
- **Backend work** → Reference `docs/api-coding-standards.md`
- **Content verification** → Reference `docs/cultural-heritage-verification.md`

## Key Documentation Files

### Core Documentation
- `docs/architecture.md` - Detailed technical architecture with system flows and diagrams
- `docs/design-system.md` - Complete frontend design system and component library guide
- `docs/api-reference.md` - Backend API documentation with endpoints and examples
- `docs/api-coding-standards.md` - Comprehensive backend coding standards
- `docs/ci-cd-pipeline.md` - Detailed CI/CD setup and troubleshooting guide
- `docs/troubleshooting.md` - Common issues and solutions

### Module Architecture Documentation
- `docs/testing.md` - Comprehensive testing guide (Playwright E2E, Vitest unit tests)
- `docs/state-management.md` - State management patterns guide (Zustand, TanStack Query, Zod)
- `docs/spring-modulith.md` - Backend module architecture guide

### Additional Documentation
- `docs/secret-management.md` - Secret management guide
- `docs/cultural-heritage-verification.md` - Cultural heritage content verification protocols
- `docs/supabase-admin-roles.md` - Supabase admin role setup and JWT-based access control
- `docs/api-roadmap.md` - Planned backend improvements and migrations
- `docs/nx-monorepo.md` - Nx monorepo commands and project graph
- `SECURITY.md` - Security policy and vulnerability reporting procedures

## Troubleshooting

For common issues, see `docs/troubleshooting.md`.

**Quick Help**:
- **CI/CD Issues**: `docs/ci-cd-pipeline.md`
- **Security Issues**: `SECURITY.md`
- **Architecture Questions**: `docs/architecture.md`

## Important Instruction Reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
