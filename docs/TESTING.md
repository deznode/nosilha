# Testing Guide - Nos Ilha Platform

This document provides comprehensive testing guidance for the Nos Ilha cultural heritage platform, covering E2E testing with Playwright, unit testing with Vitest, and component documentation with Storybook.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Pyramid](#test-pyramid)
3. [Playwright E2E Testing](#playwright-e2e-testing)
4. [Vitest Unit Testing](#vitest-unit-testing)
5. [Storybook Component Documentation](#storybook-component-documentation)
6. [Testing Patterns & Best Practices](#testing-patterns--best-practices)
7. [CI/CD Integration](#cicd-integration)
8. [Troubleshooting](#troubleshooting)

---

## Testing Philosophy

The Nos Ilha platform follows a **comprehensive testing strategy** with three complementary layers:

- **E2E Tests (Playwright)**: Verify critical user journeys work end-to-end
- **Unit Tests (Vitest)**: Test components, hooks, and utilities in isolation
- **Component Docs (Storybook)**: Document and visually test UI components

**Quality Goals:**
- ✅ Test execution time: <5 minutes for E2E suite (FR-001)
- ✅ Code coverage: >70% for components and utilities (FR-002)
- ✅ Fast feedback: <2 minutes for unit tests
- ✅ Living documentation: 20+ components documented in Storybook (FR-007)

---

## Test Pyramid

```
                    ▲
                   ╱ ╲
                  ╱   ╲
                 ╱ E2E ╲          ← 6 critical user flows (Playwright)
                ╱───────╲
               ╱         ╲
              ╱   Unit    ╲       ← 4+ component/hook tests (Vitest)
             ╱─────────────╲
            ╱               ╲
           ╱  Component Docs ╲    ← 5+ UI components (Storybook)
          ╱───────────────────╲
         ╱                     ╲
        ▼                       ▼
```

**Distribution:**
- **70%**: Unit tests (fast, isolated, high coverage)
- **20%**: Component documentation (visual, interactive)
- **10%**: E2E tests (slow, expensive, critical paths only)

---

## Playwright E2E Testing

### Configuration

**Location**: `frontend/playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Files

**Location**: `frontend/tests/e2e/`

| Test File | Purpose | Critical Flow |
|-----------|---------|---------------|
| `auth-login.spec.ts` | User authentication | Login → Session → Dashboard |
| `auth-logout.spec.ts` | Session cleanup | Logout → Clear state → Redirect |
| `directory-browsing.spec.ts` | Server-rendered content | Navigate → List → Details |
| `directory-filtering.spec.ts` | Client-side filtering | Apply filters → Update results |
| `content-creation.spec.ts` | Admin form validation | Create entry → Validate → Submit |
| `map-interaction.spec.ts` | Mapbox GL integration | Load map → Click marker → Popup |

### Writing E2E Tests

**Pattern: Page Object Model**

```typescript
// tests/e2e/directory-browsing.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Directory Browsing', () => {
  test('user can browse restaurants', async ({ page }) => {
    // Navigate to directory page
    await page.goto('/directory/restaurants');

    // Verify server-rendered content loads
    await expect(page.locator('h1')).toContainText('Restaurants');

    // Wait for client-side hydration
    await page.waitForLoadState('networkidle');

    // Interact with client component
    await page.click('[data-testid="directory-card"]:first-child');

    // Verify navigation to detail page
    await expect(page).toHaveURL(/\/directory\/entry\/.+/);
  });
});
```

**Best Practices:**
- ✅ Use `data-testid` attributes for stable selectors
- ✅ Clear authentication state between tests
- ✅ Test mobile viewports (platform is mobile-first)
- ✅ Use `waitForLoadState('networkidle')` for hydration
- ✅ Leverage Playwright MCP server for browser automation

### Running E2E Tests

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test auth-login

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Generate HTML report
npx playwright show-report
```

**Execution Time Target**: <5 minutes for complete suite

---

## Vitest Unit Testing

### Configuration

**Location**: `frontend/vitest.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        name: "unit",
        environment: "jsdom",
        setupFiles: ["./tests/setup/vitest.setup.tsx"],
        coverage: {
          provider: "v8",
          thresholds: {
            lines: 70,
            functions: 70,
            branches: 70,
            statements: 70,
          },
        },
        include: ["tests/unit/**/*.test.{ts,tsx}"],
      },
    ],
  },
});
```

### Unit Test Files

**Location**: `frontend/tests/unit/`

| Test File | Purpose | What It Tests |
|-----------|---------|---------------|
| `stores/authStore.test.ts` | Client state | Zustand store actions, persistence |
| `stores/uiStore.test.ts` | UI state | Theme toggling, modal state |
| `stores/filterStore.test.ts` | Filter state | Search params, URL sync |
| `hooks/useDirectoryEntries.test.tsx` | Server state | TanStack Query caching, Zod validation |

### Writing Unit Tests

**Pattern: Testing Zustand Stores**

```typescript
// tests/unit/stores/authStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, session: null, isLoading: false });
  });

  it('should set user and update loading state', () => {
    const { setUser } = useAuthStore.getState();
    const mockUser = { id: '123', email: 'test@example.com' };

    setUser(mockUser);

    const { user, isLoading } = useAuthStore.getState();
    expect(user).toEqual(mockUser);
    expect(isLoading).toBe(false);
  });

  it('should clear state on logout', () => {
    const { setUser, logout } = useAuthStore.getState();
    setUser({ id: '123', email: 'test@example.com' });

    logout();

    const { user, session } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(session).toBeNull();
  });
});
```

**Pattern: Testing TanStack Query Hooks**

```typescript
// tests/unit/hooks/useDirectoryEntries.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDirectoryEntries } from '@/hooks/queries/useDirectoryEntries';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useDirectoryEntries', () => {
  it('should fetch and cache directory entries', async () => {
    const { result } = renderHook(
      () => useDirectoryEntries('restaurants'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.length).toBeGreaterThan(0);
  });

  it('should validate data with Zod schema', async () => {
    const { result } = renderHook(
      () => useDirectoryEntries(),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Zod schema ensures type safety
    result.current.data?.forEach(entry => {
      expect(entry).toHaveProperty('id');
      expect(entry).toHaveProperty('name');
      expect(entry).toHaveProperty('category');
    });
  });
});
```

### Running Unit Tests

```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm run test authStore.test.ts

# Run tests matching pattern
npm run test -- --grep="authStore"
```

**Coverage Target**: >70% (lines, functions, branches, statements)

---

## Storybook Component Documentation

### Configuration

**Location**: `frontend/.storybook/main.ts`

```typescript
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
};
```

### Story Files

**Location**: `frontend/src/stories/`

| Story File | Component | Variants |
|------------|-----------|----------|
| `CatalystButton.stories.tsx` | Design system button | Primary, secondary, sizes, disabled |
| `DirectoryCard.stories.tsx` | Business listing card | Restaurant, hotel, long description |
| `PageHeader.stories.tsx` | Page navigation | Default, with breadcrumbs, with actions |
| `PhotoGalleryFilter.stories.tsx` | Gallery filtering | Open, closed, with filters |
| `ThemeToggle.stories.tsx` | Dark/light mode | Light mode, dark mode, interaction |

### Writing Stories

**Pattern: Component Story Format (CSF3)**

```typescript
// src/stories/DirectoryCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { DirectoryCard } from '@/components/ui/DirectoryCard';

const meta: Meta<typeof DirectoryCard> = {
  title: 'UI/DirectoryCard',
  component: DirectoryCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    category: {
      control: 'select',
      options: ['restaurant', 'hotel', 'landmark', 'beach'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DirectoryCard>;

export const Restaurant: Story = {
  args: {
    entry: {
      id: '1',
      name: 'Casa da Morabeza',
      category: 'restaurant',
      description: 'Family-run restaurant serving traditional cachupa',
      location: 'Nova Sintra',
      image: '/images/placeholder-restaurant.jpg',
    },
  },
};

export const WithLongDescription: Story = {
  args: {
    entry: {
      ...Restaurant.args.entry,
      description: 'A very long description that tests text overflow and truncation behavior...',
    },
  },
};
```

### Running Storybook

```bash
# Start Storybook development server
npm run storybook

# Build static Storybook
npm run build-storybook

# Run Storybook tests
npm run test-storybook
```

**Access**: http://localhost:6006

---

## Testing Patterns & Best Practices

### 1. Test Naming Convention

```typescript
describe('Component/Feature Name', () => {
  it('should perform expected action when condition is met', () => {
    // Arrange, Act, Assert
  });
});
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should update filter state when category is selected', () => {
  // Arrange
  const { setCategory } = useFilterStore.getState();

  // Act
  setCategory('restaurant');

  // Assert
  const { selectedCategory } = useFilterStore.getState();
  expect(selectedCategory).toBe('restaurant');
});
```

### 3. Mock Next.js Router

```typescript
// tests/setup/vitest.setup.tsx
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
```

### 4. Test Authentication Isolation

```typescript
test.beforeEach(async ({ page }) => {
  await page.context().clearCookies();
  await page.goto('/');
});
```

### 5. Accessibility Testing

```typescript
// Storybook addon-a11y automatically checks:
// - Color contrast
// - ARIA attributes
// - Keyboard navigation
// - Screen reader compatibility
```

---

## CI/CD Integration

### Frontend CI Workflow

**Location**: `.github/workflows/frontend-ci.yml`

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        test-type: [unit, e2e]

    steps:
      - name: Run unit tests
        if: matrix.test-type == 'unit'
        run: npm run test:coverage

      - name: Run E2E tests
        if: matrix.test-type == 'e2e'
        run: npx playwright test
```

### Quality Gates

**Coverage Threshold Enforcement:**
```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    lines: 70,
    functions: 70,
    branches: 70,
    statements: 70,
  },
}
```

**Build fails if coverage drops below 70%**

---

## Troubleshooting

### E2E Tests Taking Too Long

**Symptom**: E2E tests exceed 5-minute budget

**Diagnosis**:
```bash
npx playwright test --reporter=line
```

**Solution**:
- Enable parallel execution: `fullyParallel: true`
- Optimize selectors: Use `data-testid` instead of complex CSS
- Reduce retries in local development

### Coverage Below 70%

**Symptom**: Quality gate blocks PR

**Diagnosis**:
```bash
npm run test:coverage
open coverage/index.html
```

**Solution**:
- Identify uncovered files in HTML report
- Add tests for critical paths first
- Use coverage visualization to find gaps

### Storybook Build Fails

**Symptom**: `npm run build-storybook` errors

**Diagnosis**:
- Check for missing dependencies
- Verify Next.js 15 compatibility

**Solution**:
- Update Storybook to latest: `npx storybook@latest upgrade`
- Check `.storybook/main.ts` framework configuration

---

## Resources

- **Playwright Documentation**: https://playwright.dev/
- **Vitest Documentation**: https://vitest.dev/
- **Storybook Documentation**: https://storybook.js.org/
- **Testing Library**: https://testing-library.com/
- **Playwright MCP Server**: `frontend/README-MCP.md`

---

**Related Documentation**:
- [`ARCHITECTURE.md`](ARCHITECTURE.md) - System architecture with testing infrastructure
- [`CI_CD_TESTING.md`](CI_CD_TESTING.md) - CI/CD testing procedures
- [`CLAUDE.md`](../CLAUDE.md) - Main development guide
