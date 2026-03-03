# Nx Monorepo Guide

Quick reference for using Nx in this polyglot monorepo.

## Common Commands

### Development

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start both frontend and backend |
| `pnpm run web:dev` | Start frontend only (Next.js on port 3000) |
| `pnpm run api:dev` | Start backend only (Spring Boot on port 8080) |

### Build & Test

| Command | Description |
|---------|-------------|
| `pnpm run build` | Build all projects |
| `pnpm run test` | Run all tests |
| `pnpm run lint` | Lint all projects |
| `pnpm run web:build` | Build frontend only |
| `pnpm run api:build` | Build backend only |

### Affected Commands (CI optimized)

```bash
pnpm run affected:build   # Build only changed projects
pnpm run affected:test    # Test only changed projects
pnpm run affected:lint    # Lint only changed projects
```

### Nx Utilities

```bash
pnpm run graph            # Open dependency graph visualization
npx nx show projects      # List all projects
npx nx reset              # Clear Nx cache
```

## Available Targets

### Web (Next.js)

Auto-detected by `@nx/next` plugin: `dev`, `build`, `start`, `serve-static`

### API (Spring Boot)

Defined in `apps/api/project.json`:

| Target | Gradle Command |
|--------|----------------|
| `dev` | `./gradlew bootRun --args='--spring.profiles.active=local'` |
| `build` | `./gradlew build` |
| `test` | `./gradlew test` |
| `lint` | `./gradlew ktlintCheck` |

## Troubleshooting

```bash
npx nx show project <name>  # Check available targets
npx nx reset                # Clear stale cache
npx nx show projects --affected  # List changed projects
```

## Reference

- [ADR-0001: Nx for Polyglot Monorepo](./adr/0001-nx-monorepo.md)
- [Nx Documentation](https://nx.dev)
