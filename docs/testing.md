# Testing Guide

Testing strategy for the Nos Ilha platform, optimized for a solo-maintained open-source project.

## Testing Layers

| Layer | Environment | Tools | Purpose |
|-------|-------------|-------|---------|
| **CI/CD** | GitHub Actions | TypeScript, ESLint, Testcontainers | Automated quality gates |
| **Local** | Developer machine | Playwright, Vitest | Pre-release validation |
| **Pre-Release** | Mobile devices | Manual testing, Lighthouse | Final verification |

This approach reduces CI/CD costs by 73% while maintaining high confidence through strict TypeScript and comprehensive backend testing.

---

## Frontend Testing

### CI/CD Quality Gates (Automated)

```bash
cd apps/web
pnpm build:content           # Velite content types
pnpm lint                    # ESLint
pnpm exec tsc --noEmit       # TypeScript compilation
pnpm build                   # Next.js build
```

### E2E Tests (Local Only)

```bash
cd apps/web
pnpm run test:e2e            # Headless Chromium
pnpm run test:e2e:headed     # With browser UI
pnpm run test:e2e:debug      # Debug mode
```

**Test files** (`apps/web/tests/e2e/`):
- `auth-login.spec.ts` - User authentication flow
- `auth-logout.spec.ts` - Session cleanup
- `directory-browsing.spec.ts` - Directory navigation
- `map-interaction.spec.ts` - Mapbox integration

### Unit Tests (Local Only)

```bash
cd apps/web
pnpm run test:unit           # Run once
pnpm run test:unit --watch   # Watch mode
```

**Test files** (`apps/web/tests/unit/`):
- `stores/authStore.test.ts` - Zustand auth state
- `stores/filterStore.test.ts` - Directory filter state
- `stores/uiStore.test.ts` - UI state management
- `hooks/useDirectoryEntries.test.tsx` - TanStack Query hook

---

## Backend Testing

### CI/CD Quality Gates (Automated)

```bash
cd apps/api
./gradlew ktlintCheck        # Kotlin code style
./gradlew test               # Unit + integration tests
./gradlew jacocoTestReport   # Coverage report
```

**Note**: detekt is temporarily disabled pending Kotlin 2.3.0 compatibility.

### Testcontainers Integration

Backend tests use Testcontainers for real PostgreSQL integration:

```kotlin
@SpringBootTest
@Testcontainers
class DirectoryEntryIntegrationTest {

    companion object {
        @Container
        @JvmStatic
        val postgres = PostgreSQLContainer("postgres:16")
            .withDatabaseName("nosilha_test")
    }

    @Test
    fun `should create directory entry`() {
        // Test against real PostgreSQL
    }
}
```

**Test classes** (`apps/api/src/test/`):
- `CoreApplicationTests.kt` - Application context loading
- `ModularityTests.kt` - Spring Modulith module boundaries
- `SuggestionControllerTest.kt` - Feedback API endpoints
- `GalleryUploadIntegrationTest.kt` - Media upload flow
- `RelatedContentControllerTest.kt` - Places API endpoints
- `AdminModerationSecurityTest.kt` - Admin security validation

### Spring Modulith Validation

```bash
./gradlew test --tests "com.nosilha.core.ModularityTests"
```

Validates module structure, circular dependencies, and generates PlantUML docs in `build/modulith/`.

---

## Pre-Release Checklist

Before major deployments (15-20 minutes):

1. **Local E2E Tests**: `pnpm run test:e2e` (all 4 tests pass)
2. **Mobile Testing**: iOS Safari + Android Chrome on real devices
3. **Lighthouse Audit** (optional): `npx @lhci/cli@latest autorun`

---

## Troubleshooting

### TypeScript Errors

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Check for missing type imports, incorrect props, or API type mismatches.

### E2E Tests Fail

1. Run with UI: `pnpm run test:e2e:headed`
2. Verify dev server at http://localhost:3000
3. Check `.env.local` variables

### Backend Tests Fail

```bash
cd apps/api && ./gradlew test --info
```

Common causes: Docker not running, port conflicts, missing `application-test.yml` config.

---

## Configuration Reference

### Frontend

| File | Purpose |
|------|---------|
| `playwright.config.ts` | E2E configuration |
| `vitest.config.ts` | Unit test configuration |
| `tests/setup/global-setup.ts` | E2E test data seeding |
| `tests/setup/vitest.setup.tsx` | Unit test setup |

### Backend

| File | Purpose |
|------|---------|
| `build.gradle.kts` | Test dependencies and JaCoCo |
| `src/test/resources/application-test.yml` | Test profile |
| `TestSecurityConfig.kt` | Test security overrides |

---

## Related Documentation

- [CI/CD Pipeline](./ci-cd-pipeline.md)
- [Architecture](./architecture.md)
- [Spring Modulith](./spring-modulith.md)
