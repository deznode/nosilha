# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nos Ilha is a community-driven cultural heritage hub for Brava Island, Cape Verde. This volunteer-supported, open-source project is a full-stack web application that preserves and celebrates the island's rich cultural memory through an interactive directory of cultural sites, landmarks, and local businesses, with mapping functionality.

### System Architecture Overview

**Frontend** (Next.js 16): React 19.2, App Router, Tailwind CSS, ISR Caching, Supabase Auth
**Backend** (Spring Boot): Kotlin/JVM, PostgreSQL, JWT Auth, Domain-Driven, RESTful APIs
**Infrastructure** (GCP): Cloud Run, Artifact Registry, Secret Manager, IAM
**CI/CD** (GitHub Actions): Modular workflows, security scanning, auto-deployment, health checks

## Architecture

This is a **full-stack application** with four main components:

- **Frontend**: Next.js 16 (App Router) with React 19.2, TypeScript, and Tailwind CSS
- **Backend**: Spring Boot 4.0.0 with Kotlin 2.3.0, Java 25, PostgreSQL as the single database
- **Infrastructure**: Docker Compose for local development, Terraform for cloud deployment
- **CI/CD**: Modular GitHub Actions workflows with automated security scanning and deployment

## Project Organization

The project follows a clear organizational structure:

- **`plan/`** - Git submodule containing SpecKit specifications and planning documents (see plan repository README for details)
- **`docs/`** - Static project documentation (architecture, design system, API reference, etc.)

### Key Integration Flows

**Authentication**: User → Frontend → Supabase Auth → JWT Token → Backend Validation → Database Access
**Content Management**: Admin UI → Backend API → PostgreSQL → Cache Invalidation → Frontend Update
**Media Upload**: File Upload → Local Storage (dev) → PostgreSQL Metadata → Frontend Display
**CI/CD Deployment**: Git Push → GitHub Actions → Security Scan → Build → Deploy → Health Check

## Development Environment Setup

### Prerequisites
- **Node.js 20.9+** and npm
- **Java 25** (for backend)
- **Docker** and Docker Compose
- **PostgreSQL** (or use Docker Compose setup)

### Local Development
1. **Start infrastructure services**: `cd infrastructure/docker && docker-compose up -d`
2. **Backend setup**: `cd apps/api && ./gradlew bootRun --args='--spring.profiles.active=local'`
3. **Frontend setup**: `cd apps/web && pnpm install && pnpm run dev`

## Development Commands

For detailed commands by domain, see the modular rules:
- Frontend: @.claude/rules/frontend/app-router.md
- Backend: @.claude/rules/backend/spring-modulith.md
- Infrastructure: @.claude/rules/infrastructure/cicd-deployment.md

## Environment Configuration

### Local Development URLs
- **Frontend**: `http://localhost:3000` (Next.js with Turbopack)
- **Backend API**: `http://localhost:8080/api/v1/` (Spring Boot)
- **Database**: `localhost:5432` (PostgreSQL: database=`nosilha_db`, user=`nosilha`, password=`nosilha`)
- **Media Storage**: `./uploads` (local filesystem)

### Required Environment Variables

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Analytics Integration (optional for local development)
NEXT_PUBLIC_GA_ID=your_ga_measurement_id
NEXT_PUBLIC_CLARITY_PROJECT_ID=your_clarity_project_id
```

#### Backend (Environment Variables)
```bash
SPRING_PROFILES_ACTIVE=local
DATABASE_URL=jdbc:postgresql://localhost:5432/nosilha_db
DATABASE_USERNAME=nosilha
DATABASE_PASSWORD=nosilha
```

### Production Environment
- **Cloud Platform**: Google Cloud Platform (GCP)
- **Region**: `us-east1`
- **Services**: Cloud Run (auto-scaling serverless containers)
- **Registry**: Google Artifact Registry (`us-east1-docker.pkg.dev`)
- **Authentication**: Supabase Auth with JWT tokens

## Claude Code Memory

Use `/memory` to view and edit all loaded memory files.

### Modular Rules (.claude/rules/)

Domain-specific instructions loaded automatically based on file paths:

- `apps/web/` - Next.js App Router, design system, Playwright MCP
- `apps/api/` - Spring Modulith, API patterns
- `content/` - MDX authoring platform
- `infrastructure/` - CI/CD, Docker, cloud deployment

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

### Slash Commands

Custom workflow triggers in `.claude/commands/`. Use syntax: `/command-name [arguments]`

**SpecKit Workflow**: `/speckit.specify`, `/speckit.plan`, `/speckit.tasks`, `/speckit.implement`, `/speckit.clarify`, `/speckit.analyze`, `/speckit.constitution`, `/speckit.checklist`

**Project**: `/research <topic>` - Conduct cultural/historical research with web search

### Usage Guidelines

- **Skills**: Use for executing tasks (writing code, content, infrastructure changes)
- **Commands**: Use to trigger workflows and specialized operations

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
- `docs/sitemap.md` - Frontend route structure and navigation architecture
- `SECURITY.md` - Security policy and vulnerability reporting procedures

## Troubleshooting

For common issues, see `docs/troubleshooting.md`.

**Quick Help**:
- **CI/CD Issues**: `docs/ci-cd-pipeline.md`
- **Security Issues**: `SECURITY.md`
- **Architecture Questions**: `docs/architecture.md`

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

## Active Technologies
- Kotlin 2.3.0 / JVM 25 + Spring Boot 4.0.0, Spring Modulith 2.0.1, Spring Security 6.5, PostgreSQL
- PostgreSQL (primary), Flyway migrations
- Supabase for auth

## Recent Changes
- Updated to Kotlin 2.3.0 / Java 25 + Spring Boot 4.0.0, Spring Modulith 2.0.1
