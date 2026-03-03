---
paths: apps/web/**
---

# State Management

## Zustand Store Pattern

Stores use `create` with `devtools` wrapper, and optionally `persist`:

```typescript
// With persist (AuthStore)
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        session: null,
        isLoading: true,
        setUser: (user) => set({ user }),
        setSession: (session) => set({ session }),
        logout: () => set({ user: null, session: null, isLoading: false }),
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user, // Only persist user, not session (security)
        }),
      }
    ),
    { name: "AuthStore" }
  )
);

// Without persist (FilterStore)
export const useFilterStore = create<FilterState>()(
  devtools(
    (set, get) => ({
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),
      hasActiveFilters: () => !!get().searchQuery,
    }),
    { name: "FilterStore" }
  )
);
```

## Selector Exports

Export individual selectors for optimized re-renders — never access the entire store:

```typescript
// GOOD — granular selectors
export const useUser = () => useAuthStore((state) => state.user);
export const useSession = () => useAuthStore((state) => state.session);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.user !== null);

// BAD — subscribes to ALL state changes
const store = useAuthStore();
```

## TanStack Query Hooks

```typescript
export function useContributions(
  options?: Omit<UseQueryOptions<ContributionsDto, Error>, "queryKey" | "queryFn">
) {
  const isAuthenticated = useIsAuthenticated();
  const apiClient = getApiClient();

  const query = useQuery<ContributionsDto, Error>({
    queryKey: ["user", "contributions"],
    queryFn: async () => apiClient.getContributions(),
    staleTime: 2 * 60 * 1000,   // 2 minutes
    gcTime: 10 * 60 * 1000,     // 10 minutes
    enabled: isAuthenticated,    // Conditional query
    ...options,
  });

  return {
    contributions: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
```

QueryClient defaults (in `lib/query-client.ts`):

```typescript
defaultOptions: {
  queries: {
    staleTime: 60 * 1000,        // 1 minute
    gcTime: 5 * 60 * 1000,       // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
}
```

## Zod Schemas

Schemas live in `src/lib/validation/` or `src/lib/content/schemas.ts`:

```typescript
import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Invalid email"),
  website: z.string().optional(), // Honeypot
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

// Composable schemas
export const BaseContentSchema = z.object({
  slug: z.string().min(3).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(100),
  tags: z.array(z.string().min(2).max(30)).min(1).max(10),
});

export const ArticleSchema = BaseContentSchema.extend({
  series: z.string().optional(),
  seriesOrder: z.number().int().positive().optional(),
}).refine(
  (data) => !(data.series && !data.seriesOrder),
  { message: "Both series and seriesOrder must be provided together" }
);
```

## Reference

- See `docs/20-architecture/state-management.md` for comprehensive state management guide
- Store files: `apps/web/src/stores/`
- Query hooks: `apps/web/src/hooks/queries/`
