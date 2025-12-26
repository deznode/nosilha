# Nos Ilha Project Structure Review

**Date:** December 2025
**Overall Assessment:** 7/10 → 8/10 (after P0+P1 completion) → 9/10 (after P2+P3)
**Status:** ALL PHASES COMPLETE (P0-P7)

---

## Executive Summary

Nos Ilha is a well-organized polyglot project with a Next.js 16 frontend and Spring Boot 4.0/Kotlin 2.2 backend. The project has excellent documentation and modular CI/CD, but lacks proper monorepo tooling for unified build orchestration. Critical issues include a 738MB cache directory and a nested Git repository that need immediate attention.

### Key Metrics

| Metric                   | Value                                           |
| ------------------------ | ----------------------------------------------- |
| Top-level directories    | 15                                              |
| Git submodules           | 1 (plan/)                                       |
| Application count        | 2 (frontend + backend)                          |
| Documentation files      | 21 in docs/, 10 specs in plan/                  |
| CI/CD workflows          | 11 modular workflows                            |

### Priority Actions

| Priority | Action                             | Effort | Impact | Status |
| -------- | ---------------------------------- | ------ | ------ | ------ |
| **P0**   | Fix .playwright-mcp/ in .gitignore | Low    | High   | ✅ Done |
| **P0**   | Add nosilha-ideate/ to .gitignore  | Low    | High   | ✅ Done |
| **P1**   | Add `pnpm-workspace.yaml`          | Low    | High   | ✅ Done |
| **P1**   | Add Nx for build orchestration     | Medium | High   | ✅ Done |
| **P2**   | Add ADR structure                  | Low    | Medium | ✅ Done |
| **P2**   | Relocate .google-stitch/           | Low    | Medium | ✅ Done |
| **P3**   | Migrate to apps/web + apps/api     | Medium | Medium | ✅ Done |

---

## Critical Issues

### 1. .playwright-mcp/ Cache (738MB)

**Issue:** Massive Playwright MCP server cache potentially committed to git

**Impact:** Repository bloat, slow clones, wasted storage

**Fix:**
```bash
# Add to .gitignore
.playwright-mcp/
```

### 2. nosilha-ideate/ Git-in-Git

**Issue:** Standalone `.git` directory inside main repo (not a proper submodule)

**Impact:** Git confusion, potential merge conflicts, nested history

**Decision:** Add to .gitignore (temporary reference for ideation, will be removed later)

```bash
# Add to .gitignore
nosilha-ideate/
```

---

## Nx vs Turborepo: Recommendation

### Research Summary

Given the polyglot nature of this project (Next.js + Spring Boot/Kotlin), we evaluated the two leading monorepo tools.

### Comparison Table

| Feature                    | Turborepo                           | Nx                                    |
| -------------------------- | ----------------------------------- | ------------------------------------- |
| **Primary Focus**          | JavaScript/TypeScript               | Language-agnostic (polyglot)          |
| **Gradle/Kotlin Support**  | None (JS-only)                      | Official `@nx/gradle` plugin          |
| **Spring Boot Support**    | Not supported                       | First-class support via plugin        |
| **Task Caching**           | Excellent                           | Excellent                             |
| **Setup Complexity**       | Minimal                             | More configuration required           |
| **Affected Commands**      | JS packages only                    | Cross-language (TS + JVM)             |
| **Task Graph**             | Basic                               | Advanced visualization                |

### Recommendation: Use Nx

**For Nos Ilha specifically, Nx is the clear choice because:**

1. **Polyglot support** - Official `@nx/gradle` plugin handles Spring Boot 4.0 + Kotlin 2.2 natively
2. **Unified workflow** - Single `nx affected` command for both frontend and backend changes
3. **Better CI** - One task graph across all applications with caching
4. **Future-proof** - Nx continues expanding JVM support (Android, Kotlin Multiplatform)

### Key Configuration

**Gradle plugin setup:**
```kotlin
plugins {
    id("dev.nx.gradle.project-graph") version "0.1.0"
}

allprojects {
    apply {
        plugin("dev.nx.gradle.project-graph")
    }
}
```

**nx.json configuration:**
```json
{
  "plugins": [
    {
      "plugin": "@nx/gradle",
      "options": {
        "testTargetName": "test",
        "buildTargetName": "build"
      }
    },
    {
      "plugin": "@nx/next/plugin",
      "options": {
        "devTargetName": "dev",
        "buildTargetName": "build"
      }
    }
  ]
}
```

### Sources

- [Nx Blog - Polyglot Projects Made Easy](https://nx.dev/blog/spring-boot-with-nx)
- [Nx Gradle Tutorial](https://nx.dev/docs/getting-started/tutorials/gradle-tutorial)
- [The Journey of the Nx Plugin for Gradle](https://nx.dev/blog/journey-of-the-nx-plugin-for-gradle)
- [Building a Kotlin + React TypeScript Monorepo with Nx](https://blog.ardikapras.com/building-a-kotlin-react-typescript-monorepo-with-nx-2e9fc71f82f7)

---

## Current Structure Assessment

### Architecture Overview

```text
nosilha/
├── frontend/             # Next.js 16 + React 19.2 (TypeScript)
├── backend/              # Spring Boot 4.0 + Kotlin 2.2
├── infrastructure/       # Docker Compose + Terraform
├── docs/                 # Technical documentation (21 files)
├── plan/                 # Git submodule (SpecKit specs)
├── design-intent/        # Design patterns and memory
├── brand/                # Visual identity assets
├── scripts/              # Automation utilities
├── reviews/              # Code review artifacts
├── uploads/              # Local media storage (empty)
├── nosilha-ideate/       # Google AI Studio prototype (nested git)
├── .claude/              # Claude Code configuration
├── .google-stitch/       # Google Stitch prompts (should relocate)
├── .specify/             # SpecKit templates
├── .playwright-mcp/      # Playwright MCP cache (738MB - CRITICAL)
└── .github/              # CI/CD workflows (11 files)
```

### Strengths

#### 1. Excellent Documentation Structure

- **21 comprehensive docs** in `/docs/` covering architecture, API, testing, CI/CD
- **10 formal specs** in `/plan/specs/` using SpecKit workflow
- **25 discovery features** in `/plan/discovery-features/` for ideation
- **Cultural research** in `/plan/content/cultural-research/`

#### 2. Strong Claude Code Integration

- Well-organized `.claude/` with skills, commands, and rules
- Domain-specific rules (backend, frontend, content, infrastructure)
- AGENTS.md and GEMINI.md symlinks for multi-tool compatibility

#### 3. Modular CI/CD Architecture

11 workflows with path-based triggering:
- `backend-ci.yml` - Spring Boot/Kotlin pipeline with Testcontainers
- `frontend-ci.yml` - TypeScript-first quality gates (75% faster than E2E in CI)
- `pr-validation.yml` - Smart orchestration with Dependabot auto-merge
- Security scanning (Trivy, detekt, ESLint SARIF)

#### 4. Modern Tech Stack

| Component | Version | Notes |
|-----------|---------|-------|
| Next.js | 16.0.7 | App Router, Turbopack |
| React | 19.2.0 | Server Components |
| Spring Boot | 4.0.0 | Modulith architecture |
| Kotlin | 2.2.0 | JVM 21 |
| Tailwind | 4.0 | PostCSS-based |
| PostgreSQL | - | Flyway migrations |

#### 5. Design Intent System

Innovative approach with:
- `/design-intent/memory/` - Constitution, vision, team roles
- `/design-intent/diary/` - Session documentation
- `/design-intent/patterns/` - Design pattern catalog

### Weaknesses

#### 1. Missing Workspace Configuration

No `pnpm-workspace.yaml` despite using pnpm. This prevents:
- Unified dependency management
- Cross-package imports
- Root-level scripts

#### 2. No Build Orchestration

Missing `nx.json` or `turbo.json` means:
- No task caching
- No dependency-aware task execution
- Manual coordination between frontend/backend
- Separate `cd frontend && pnpm dev` and `cd backend && ./gradlew bootRun`

#### 3. Hidden Directory Organization

Inconsistent use of hidden directories:
- `.google-stitch/` (11MB) - Project artifacts in hidden directory (should be visible)
- `.playwright-mcp/` (738MB) - Cache not in .gitignore (CRITICAL)

#### 4. No Architecture Decision Records

ADRs missing despite complex architectural choices:
- Spring Modulith adoption
- Supabase for auth
- Nx vs Turborepo decision

#### 5. Nested Git Repository

`nosilha-ideate/` has its own `.git` but isn't a submodule, causing Git confusion.

---

## Gap Analysis

| Best Practice        | Current State | Gap                            | Priority |
| -------------------- | ------------- | ------------------------------ | -------- |
| .gitignore complete  | Missing items | Add .playwright-mcp/, nosilha-ideate/ | P0   |
| Workspace config     | Missing       | Create `pnpm-workspace.yaml`   | P1       |
| Build orchestration  | None          | Add Nx with @nx/gradle         | P1       |
| Root package.json    | Missing       | Add unified scripts            | P1       |
| ADR structure        | Missing       | Add `/docs/adr/`               | P2       |
| Hidden dirs cleanup  | Inconsistent  | Relocate .google-stitch/       | P2       |
| Development standards| Partial       | Add .editorconfig, .nvmrc      | P2       |

---

## Prioritized Recommendations

### P0 - Critical (Immediate)

#### 0.1 Fix .gitignore

Add to `.gitignore`:
```bash
# Playwright MCP cache
.playwright-mcp/

# Ideation prototype (temporary)
nosilha-ideate/
```

### P1 - High Priority (This Week)

#### 1.1 Add Workspace Configuration

Create `pnpm-workspace.yaml` at root:

```yaml
packages:
  - 'frontend'
  - 'packages/*'
```

#### 1.2 Add Root package.json

```json
{
  "name": "nosilha-monorepo",
  "private": true,
  "packageManager": "pnpm@10.0.0",
  "engines": {
    "node": ">=20.9.0"
  },
  "scripts": {
    "dev": "nx run-many -t dev",
    "build": "nx run-many -t build",
    "test": "nx run-many -t test",
    "lint": "nx run-many -t lint",
    "affected:build": "nx affected -t build",
    "affected:test": "nx affected -t test",
    "graph": "nx graph"
  }
}
```

#### 1.3 Initialize Nx

```bash
npx nx@latest init
pnpm add -D @nx/gradle @nx/next @nx/playwright @nx/eslint
```

### P2 - Medium Priority (This Month)

#### 2.1 Add Architecture Decision Records

Create `/docs/adr/` structure:

```text
docs/adr/
├── README.md           # Index of ADRs
├── template.md         # ADR template
└── 001-nx-monorepo.md  # First ADR
```

#### 2.2 Relocate .google-stitch/

Move from hidden to visible location:
```bash
mv .google-stitch/ design-intent/google-stitch/
```

#### 2.3 Add Development Standards

Create `/.editorconfig`:
```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8

[*.{kt,kts,java}]
indent_size = 4
```

Create `/.nvmrc`:
```
20
```

---

## Build & CI/CD Analysis

### Current Build System

| Service | Tool | Config File | Scripts |
|---------|------|-------------|---------|
| Frontend | pnpm 10 + Next.js | `frontend/package.json` | 43 scripts |
| Backend | Gradle 8+ | `backend/build.gradle.kts` | bootRun, build, test |
| Infra | Docker Compose | `infrastructure/docker/docker-compose.yml` | N/A |

### CI/CD Strengths

- **Path-based triggering** - Only builds affected services
- **TypeScript-first quality** - 75% faster than E2E in CI (ESLint + tsc only)
- **Comprehensive security** - Trivy, detekt, ESLint SARIF reports
- **Budget-conscious** - E2E tests local-only, conditional deployment

### CI/CD Integration with Nx

Update `/.github/workflows/pr-validation.yml`:
```yaml
- name: Nx Affected
  run: |
    npx nx affected -t lint test build --base=origin/main
```

---

## Documentation Analysis

### Current Structure (4 Locations)

| Location | Purpose | Files |
|----------|---------|-------|
| `/docs/` | Technical documentation | 21 |
| `/plan/` | SpecKit specs + research (submodule) | 10 specs, 25 discovery, 19 research |
| `/design-intent/` | Design patterns, memory, diary | 5 |
| `/frontend/docs/` | Frontend-specific guides | 5 |

### Documentation Strengths

1. **Comprehensive coverage** - Architecture, API, testing, CI/CD, security
2. **SpecKit workflow** - Formal spec → plan → tasks → implementation
3. **Cultural research** - Heritage verification protocols
4. **Design intent framework** - Session diaries, pattern catalog

### Documentation Gaps

1. **No ADRs** - Architectural decisions scattered across multiple docs
2. **No documentation index** - Need to know where to look
3. **Frontend docs isolated** - Should link from main `/docs/`

---

## Implementation Roadmap

### Phase 1: Critical Fixes ✅ COMPLETE

- [x] Update `.gitignore` with .playwright-mcp/ and nosilha-ideate/
- [x] Verify .playwright-mcp/ not committed to git
- [x] Add `node_modules/` to root `.gitignore`
- [ ] Investigate empty `/frontend/lib/` directory

### Phase 2: Workspace Foundation ✅ COMPLETE

- [x] Create `pnpm-workspace.yaml`
- [x] Create root `package.json`
- [x] Add `.editorconfig` and `.nvmrc`

### Phase 3: Nx Setup ✅ COMPLETE

- [x] Initialize Nx (manual config instead of `npx nx init`)
- [x] Install `@nx/next`, `@nx/eslint` (using nx:run-commands for Gradle instead of @nx/gradle)
- [x] Configure `nx.json` with @nx/next plugin
- [x] Create `frontend/project.json` (uses plugin inference)
- [x] Create `backend/project.json` (manual targets with caching)
- [x] Verify `nx graph` shows both projects
- [ ] Optional: Install `@nx/gradle` for native Gradle integration

### Phase 4: ADRs (P2) ✅ COMPLETE

- [x] Create `/docs/adr/README.md` with index
- [x] Create `/docs/adr/template.md`
- [x] Write ADR-001: Nx Monorepo (Nx over Turborepo for polyglot)
- [x] Write ADR-002: Spring Modulith (modular monolith over microservices)
- [x] Write ADR-003: Supabase Auth (external auth provider)
- [x] Relocate `.google-stitch/` to `design-intent/google-stitch/`

### Phase 5: Directory Migration (P3) ✅ COMPLETE

Migrate from `frontend/` + `backend/` to `apps/web/` + `apps/api/`:

- [x] Create `apps/` directory
- [x] Move `frontend/` → `apps/web/`
- [x] Move `backend/` → `apps/api/`
- [x] Update `nx.json` with workspaceLayout (not needed - auto-discovers)
- [x] Update `pnpm-workspace.yaml` to `'apps/web'`
- [x] Update root `package.json` scripts
- [x] Update `apps/web/project.json` paths
- [x] Update `apps/api/project.json` paths
- [x] Update CI/CD workflows (7 files)
- [x] Update `infrastructure/docker/docker-compose.yml`
- [x] Update `.mcp.json`
- [x] Update documentation files (17 docs/, 14 .claude/, CLAUDE.md)

### Phase 6: CI/CD Integration ✅ COMPLETE

- [x] Update `pr-validation.yml` with Nx affected commands
- [x] Test affected commands on branch
- [ ] Optional: Add Nx Cloud for distributed caching (skipped - can add later)

### Phase 7: Cleanup ✅ COMPLETE

- [x] Create `libs/shared/.gitkeep` for future packages
- [x] Create `libs/README.md` with organization guidelines
- [x] Final verification of `nx affected -t build`

---

## Success Criteria

- [x] `nx graph` shows both frontend and backend projects (now "web" and "api")
- [x] `nx affected -t build` correctly identifies changed projects
- [x] CI/CD uses Nx commands with caching (pr-validation.yml updated)
- [x] All critical issues resolved (.playwright-mcp/, nosilha-ideate/, node_modules/)
- [x] ADR structure in place with 3 decisions documented
- [x] Directory structure follows `apps/web` + `apps/api` convention
- [x] CI/CD workflows trigger correctly on new paths
- [x] All verification checklist items pass

---

## Resolved Decisions

1. **nosilha-ideate/** - Add to .gitignore (temporary reference, will be removed later)
2. **AI symlinks** - Keep AGENTS.md/GEMINI.md symlinks for multi-tool compatibility
3. **Build tool** - Nx with @nx/gradle (not Turborepo) for polyglot support
4. **Shared packages** - Create structure for future use, no immediate population needed
5. **App folder naming** - Use `apps/web` + `apps/api` (industry-standard technology-based naming)
6. **Brand location** - Keep `brand/` at root level (high visibility, not documentation)

---

## Sources

1. [Nx Blog - Polyglot Projects Made Easy: Integrating Spring Boot into an Nx Workspace](https://nx.dev/blog/spring-boot-with-nx)
2. [Nx Blog - The Journey of the Nx Plugin for Gradle](https://nx.dev/blog/journey-of-the-nx-plugin-for-gradle)
3. [Nx Docs - Gradle Tutorial](https://nx.dev/docs/getting-started/tutorials/gradle-tutorial)
4. [Turborepo Docs - Structuring a Repository](https://turbo.build/docs/crafting-your-repository/structuring-a-repository)
5. [pnpm Documentation - Workspaces](https://pnpm.io/workspaces)
6. [Building a Kotlin + React TypeScript Monorepo with Nx](https://blog.ardikapras.com/building-a-kotlin-react-typescript-monorepo-with-nx-2e9fc71f82f7)
7. [Nx Docs - Folder Structure](https://nx.dev/docs/concepts/decisions/folder-structure)
8. [Graphite - Frontend/Backend Monorepo Best Practices](https://graphite.com/guides/monorepo-frontend-backend-best-practices)
9. [AWS - ADR Best Practices](https://amazonaws.cn/en/blog-selection/master-architecture-decision-records-adrs-best-practices-for-effective-decision-making)
10. [Synergy Design System Monorepo](https://github.com/synergy-design-system/synergy-design-system)

---

*Report generated: December 2025*
*Next review: Q1 2026*
