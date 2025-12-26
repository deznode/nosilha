# ADR-0001: Nx for Polyglot Monorepo Orchestration

## Status

Accepted

## Date

2025-12-26

## Context

Nos Ilha is a polyglot full-stack application with:
- **Frontend**: Next.js 16 with React 19.2 (TypeScript/Node.js)
- **Backend**: Spring Boot 4.0.1 with Kotlin 2.2 (JVM 21/Gradle)

The project needed unified build orchestration to:
1. Run tasks across both frontend and backend from a single command
2. Enable intelligent caching for faster builds
3. Support `affected` commands to only build/test changed projects
4. Integrate with existing CI/CD pipelines

Two leading monorepo tools were evaluated: **Turborepo** and **Nx**.

## Decision

We chose **Nx** over Turborepo for monorepo build orchestration.

## Decision Drivers

### 1. Polyglot Support (Primary Factor)

| Tool | JavaScript/TypeScript | JVM (Gradle/Kotlin) |
|------|----------------------|---------------------|
| Turborepo | Native support | Not supported |
| Nx | Native support | Official `@nx/gradle` plugin |

Turborepo only supports JavaScript/TypeScript projects. Nx provides first-class support for polyglot monorepos through its plugin architecture.

### 2. Unified Tooling

Nx provides a single `nx affected` command that works across both frontend and backend:
- `nx affected -t build` - builds only changed projects
- `nx affected -t test` - tests only changed projects
- `nx affected -t lint` - lints only changed projects

### 3. Native Gradle Integration

Nx offers official `@nx/gradle` plugin that:
- Reads Gradle project structure automatically
- Maps Gradle tasks to Nx targets
- Enables cross-language dependency graph
- Supports task caching for Gradle builds

### 4. Cross-Language Affected Commands

With Nx, a change to shared code correctly triggers rebuilds of both frontend and backend, even though they use different build systems.

### 5. Future-Proofing

Nx continues expanding JVM support (Android, Kotlin Multiplatform), making it suitable for potential future additions to the tech stack.

## Considered Alternatives

### Turborepo

**Pros:**
- Simpler configuration
- Excellent JavaScript/TypeScript caching
- Minimal learning curve

**Cons:**
- No JVM/Gradle support
- Limited to JavaScript ecosystem
- Cannot orchestrate Spring Boot backend

**Verdict:** Rejected due to JavaScript-only limitation.

### No Monorepo Tool (Status Quo)

**Pros:**
- No additional tooling complexity
- Familiar workflows

**Cons:**
- Manual coordination between `cd frontend && pnpm dev` and `cd backend && ./gradlew bootRun`
- No task caching
- No affected commands
- Duplicate CI/CD logic

**Verdict:** Rejected due to lack of unified orchestration.

## Consequences

### Positive

1. **Unified CLI**: `nx run-many -t build` builds both frontend and backend
2. **Intelligent Caching**: Repeated builds skip unchanged projects
3. **Simplified CI/CD**: Single `nx affected` command replaces multiple workflow conditionals
4. **Dependency Visualization**: `nx graph` shows project dependencies across languages
5. **Consistent Developer Experience**: Same commands work for frontend and backend

### Negative

1. **Additional Configuration**: Requires `nx.json`, `project.json` files, and root `package.json`
2. **Learning Curve**: Team members need to learn Nx commands
3. **Node.js Dependency**: Even backend builds now require Node.js (already required for frontend)

### Neutral

1. **`@nx/gradle` Not Yet Installed**: Currently using `nx:run-commands` executor for Gradle targets (simpler setup, same caching benefits). Migration to `@nx/gradle` plugin is optional future enhancement.

## Implementation Details

### Configuration Files

| File | Purpose |
|------|---------|
| `nx.json` | Nx workspace configuration with `@nx/next` plugin |
| `package.json` | Root package with Nx scripts and dependencies |
| `pnpm-workspace.yaml` | pnpm workspace configuration |
| `frontend/project.json` | Frontend project definition (uses plugin inference) |
| `backend/project.json` | Backend project definition with manual Gradle targets |

### Root Scripts

```json
{
  "scripts": {
    "dev": "nx run-many -t dev",
    "build": "nx run-many -t build",
    "test": "nx run-many -t test",
    "affected:build": "nx affected -t build",
    "affected:test": "nx affected -t test"
  }
}
```

### Backend Gradle Integration

Backend targets use `nx:run-commands` executor with caching:

```json
{
  "targets": {
    "build": {
      "executor": "nx:run-commands",
      "options": { "command": "./gradlew build", "cwd": "backend" },
      "cache": true,
      "inputs": ["{projectRoot}/src/**/*", "{projectRoot}/build.gradle.kts"],
      "outputs": ["{projectRoot}/build"]
    }
  }
}
```

## References

- [Nx Blog: Polyglot Projects Made Easy - Spring Boot with Nx](https://nx.dev/blog/spring-boot-with-nx)
- [Nx Documentation: Gradle Tutorial](https://nx.dev/docs/getting-started/tutorials/gradle-tutorial)
- [Nx Blog: Journey of the Nx Plugin for Gradle](https://nx.dev/blog/journey-of-the-nx-plugin-for-gradle)
- [Building a Kotlin + React TypeScript Monorepo with Nx](https://blog.ardikapras.com/building-a-kotlin-react-typescript-monorepo-with-nx-2e9fc71f82f7)
- [Internal: project-structure-review.md](../../project-structure-review.md)
