# Nx Monorepo Guide

Quick reference for using Nx in this polyglot monorepo.

## Quick Start

```bash
pnpm install          # Install dependencies (includes Nx)
pnpm run dev          # Start both frontend and backend
```

## Common Commands

### Development

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start both frontend and backend |
| `pnpm run web:dev` | Start frontend only (Next.js on port 3000) |
| `pnpm run api:dev` | Start backend only (Spring Boot on port 8080) |
| `pnpm run api:serve` | Alias for `api:dev` |

### Build & Test

| Command | Description |
|---------|-------------|
| `pnpm run build` | Build all projects |
| `pnpm run test` | Run all tests |
| `pnpm run lint` | Lint all projects |
| `pnpm run web:build` | Build frontend only |
| `pnpm run api:build` | Build backend only |
| `pnpm run api:test` | Test backend only |

### Affected Commands (CI/CD optimized)

Only run tasks on projects affected by recent changes:

```bash
pnpm run affected:build   # Build only changed projects
pnpm run affected:test    # Test only changed projects
pnpm run affected:lint    # Lint only changed projects
```

### Nx Utilities

```bash
pnpm run graph            # Open dependency graph visualization
npx nx show projects      # List all projects
npx nx show project web   # Show web project details
npx nx show project api   # Show api project details
```

## Project Structure

```
nosilha/
├── apps/
│   ├── web/             # Next.js frontend (TypeScript)
│   │   └── project.json # Targets inferred from @nx/next plugin
│   └── api/             # Spring Boot backend (Kotlin)
│       └── project.json # Explicit Gradle targets
├── nx.json              # Nx workspace configuration
├── package.json         # Root scripts and dependencies
└── pnpm-workspace.yaml  # pnpm workspace configuration
```

## Available Targets

### Web (Next.js)

Targets auto-detected by `@nx/next` plugin:

| Target | Command |
|--------|---------|
| `dev` | `next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `serve-static` | Serve built app statically |

### API (Spring Boot)

Targets defined in `apps/api/project.json`:

| Target | Gradle Command |
|--------|----------------|
| `dev` | `./gradlew bootRun --args='--spring.profiles.active=local'` |
| `serve` | Same as `dev` (alias) |
| `build` | `./gradlew build` |
| `test` | `./gradlew test` |
| `lint` | `./gradlew ktlintCheck` |

## Running Tasks Directly

You can run any target directly with Nx:

```bash
npx nx run web:dev       # Same as pnpm run web:dev
npx nx run api:build     # Same as pnpm run api:build
npx nx run-many -t build # Run build target on all projects
```

## Caching

Nx caches task results automatically. Cached targets:
- `build` - Skips if inputs unchanged
- `test` - Skips if inputs unchanged
- `lint` - Skips if inputs unchanged

Cache is stored in `node_modules/.cache/nx`.

To clear cache:

```bash
npx nx reset
```

## Troubleshooting

### "Target not found" error

```bash
npx nx show project <project-name>  # Check available targets
```

### Stale cache issues

```bash
npx nx reset                        # Clear Nx cache
```

### View what changed

```bash
npx nx show projects --affected     # List affected projects
npx nx affected:graph               # Visual graph of affected projects
```

## Reference

- [ADR-0001: Nx for Polyglot Monorepo](./adr/0001-nx-monorepo.md) - Decision record for Nx adoption
- [Nx Documentation](https://nx.dev/getting-started/intro)
- [Nx Gradle Plugin](https://nx.dev/nx-api/gradle)
