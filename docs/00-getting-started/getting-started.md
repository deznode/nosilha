# Getting Started

This guide walks you through setting up the Nos Ilha development environment from scratch.

## Prerequisites

Install these tools before proceeding:

| Tool | Install | Verify |
|------|---------|--------|
| **Docker Desktop** | `brew install --cask docker` | `docker --version` |
| **Node.js 20.9+** | `nvm install` (reads `.nvmrc`) | `node --version` |
| **pnpm** | `npm install -g pnpm` | `pnpm --version` |
| **Java 25** | `sdk install java 25-open` | `java --version` |
| **Taskfile** | `brew install go-task` | `task --version` |

Run `task check` to verify all prerequisites at once.

## Quick Start (Full-Stack)

Three commands to go from clone to running:

```bash
task check    # Verify prerequisites
task setup    # Copy web env template, install web dependencies
task dev      # Start API (auto-starts postgres) + web in parallel
```

Before running `task dev`, copy the backend config template:

```bash
cp apps/api/src/main/resources/application-local.yml.example apps/api/src/main/resources/application-local.yml
```

The API server uses Spring Boot Docker Compose integration to automatically start and configure PostgreSQL — no manual `docker-compose up` needed.

## Quick Start (Web-Only / Mock API)

For frontend-only work without the backend:

```bash
task setup:mock    # Copy mock env template, install dependencies
task dev:web       # Start web dev server only
```

This configures the frontend to use mock data and a Supabase stub client, so you don't need Java, PostgreSQL, or Supabase credentials.

## Environment Files

### Frontend: `apps/web/.env.local`

Copied from `.env.local.example` by `task setup`. Key variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend URL (`http://localhost:8080` for local) |
| `NEXT_PUBLIC_USE_MOCK_API` | Yes | `true` for mock data, `false` for real backend |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | For maps | [Get a token](https://account.mapbox.com/) |
| `NEXT_PUBLIC_SUPABASE_URL` | For auth | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For auth | Your Supabase anon key |

### Backend: `apps/api/src/main/resources/application-local.yml`

Copy from `application-local.yml.example`. Key sections:

| Section | Description |
|---------|-------------|
| `spring.docker.compose` | Auto-starts PostgreSQL from Docker Compose file |
| `supabase.project-url` | Your Supabase project URL (for JWT verification) |
| `spring.security.oauth2` | JWKS-based JWT verification (auto-configured from Supabase URL) |

The database connection (URL, username, password) is auto-configured from the running Docker container — no manual datasource setup needed.

## Daily Workflows

| What | Command |
|------|---------|
| Start everything | `task dev` |
| Start API only | `task dev:api` |
| Start web only | `task dev:web` |
| Start database only | `task dev:db` |
| Run all tests | `task test` |
| Run API tests | `task test:api` |
| Run web tests | `task test:web` |
| Run all linters | `task lint` |
| Stop database | `task stop` |
| Clean build artifacts | `task clean` |

## Application URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api/v1/ |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Health Check | http://localhost:8080/actuator/health |
| PostgreSQL | `localhost:5432` (db: `nosilha_db`, user: `nosilha`, password: `nosilha`) |

## Verification

After running `task dev`, confirm everything works:

```bash
# Backend health check
curl http://localhost:8080/actuator/health

# API endpoint
curl http://localhost:8080/api/v1/directory/entries

# Database connection (if needed)
docker compose -f infrastructure/docker/docker-compose.yml exec db psql -U nosilha -d nosilha_db -c "SELECT version();"
```

## Task Runners

The project uses three complementary tools:

- **`task <command>`** — Daily developer workflows (setup, run, stop, clean). Defined in `Taskfile.yml`. Use this for all routine development tasks.
- **`pnpm run <command>`** — Frontend build tooling with caching. Defined in `apps/web/package.json`. Use for build, lint, and test commands within the web app.
- **`./gradlew <command>`** — Gradle build for the backend. Use when you need specific Gradle flags or tasks not exposed through Taskfile.

When in doubt, start with `task`. It wraps the underlying tools with sensible defaults.

## Troubleshooting

See [troubleshooting.md](troubleshooting.md) for the full list. Common issues:

**Port already in use (3000 or 8080)**
Kill the process using the port: `lsof -ti:3000 | xargs kill -9`

**Docker not running**
Start Docker Desktop, then retry `task dev`. The API server will fail to start if Docker isn't available.

**Missing `.env.local` or `application-local.yml`**
Run `task setup` to copy environment templates. For mock-only mode, run `task setup:mock`.

## Next Steps

- [Architecture](../20-architecture/architecture.md) — System design and module boundaries
- [Design System](../10-product/design-system.md) — UI components, colors, typography
- [API Reference](../20-architecture/api-reference.md) — Backend endpoints and schemas
- [API Coding Standards](../20-architecture/api-coding-standards.md) — Backend conventions
- [Testing Guide](../20-architecture/testing.md) — E2E and unit testing
- [CI/CD Pipeline](../40-operations/ci-cd-pipeline.md) — Deployment and automation
