# State Management Guide - Nos Ilha Platform

This document provides comprehensive guidance on state management in the Nos Ilha cultural heritage platform, covering Zustand for client state, TanStack Query for server state, and Zod for runtime validation.

## Table of Contents

1. [State Management Philosophy](#state-management-philosophy)
2. [Architecture Overview](#architecture-overview)
3. [Zustand: Client State Management](#zustand-client-state-management)
4. [TanStack Query: Server State Management](#tanstack-query-server-state-management)
5. [Zod: Runtime Validation](#zod-runtime-validation)
6. [Integration Patterns](#integration-patterns)
7. [Best Practices](#best-practices)
8. [Migration Guide](#migration-guide)
9. [Troubleshooting](#troubleshooting)

---

## State Management Philosophy

The Nos Ilha platform uses a **modern, layered state management architecture** that clearly separates concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                  State Management Layers                    │
├─────────────────────────────────────────────────────────────┤
│  Client State (Zustand)  │  Server State (TanStack Query)   │
├──────────────────────────┼──────────────────────────────────┤
│  • UI preferences        │  • API data                      │
│  • Authentication        │  • Directory entries             │
│  • Filter selections     │  • User profiles                 │
│  • Modal state           │  • Media metadata                │
├──────────────────────────┴──────────────────────────────────┤
│            Runtime Validation (Zod)                         │
│  • Form validation • API response validation • Type safety  │
└─────────────────────────────────────────────────────────────┘
```

**Key Principles:**
- ✅ **Clear Separation**: Client state vs server state
- ✅ **Type Safety**: TypeScript + Zod runtime validation
- ✅ **Performance**: Selective re-renders, automatic caching
- ✅ **Developer Experience**: Minimal boilerplate, excellent DevTools

---

## Architecture Overview

### File Structure

```
apps/web/src/
├── stores/                    # Zustand stores (client state)
│   ├── authStore.ts          # Authentication state
│   ├── uiStore.ts            # UI preferences and modal state
│   ├── filterStore.ts        # Search and filter state
│   └── index.ts              # Centralized exports
├── hooks/queries/             # TanStack Query hooks (server state)
│   ├── useDirectoryEntries.ts  # Directory listing queries
│   ├── useDirectoryEntry.ts    # Single entry queries
│   ├── useUserProfile.ts       # User profile queries
│   ├── useMediaMetadata.ts     # Media metadata queries
│   └── index.ts                # Centralized exports
└── schemas/                   # Zod validation schemas
    ├── directoryEntrySchema.ts # Directory entry validation
    ├── authSchema.ts           # Authentication form validation
    ├── filterSchema.ts         # Filter parameter validation
    ├── userProfileSchema.ts    # User profile validation
    ├── mediaMetadataSchema.ts  # Media metadata validation
    └── index.ts                # Centralized exports
```

---

## Zustand: Client State Management

### Overview

Zustand manages **client-side state** that lives in the browser:
- User authentication (session, user object)
- UI preferences (theme, language)
- Transient state (modals, filter panel visibility)
- URL-synced state (search parameters)

### Basic Store Pattern

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: null,
        session: null,
        isLoading: true,

        // Actions
        setUser: (user) => set({ user, isLoading: false }),
        setSession: (session) => set({ session }),
        logout: () => set({ user: null, session: null }),
      }),
      {
        name: 'auth-storage', // LocalStorage key
      }
    ),
    { name: 'AuthStore' } // Redux DevTools name
  )
);
```

### Middleware Explained

**1. `persist` Middleware**
```typescript
persist(
  (set, get) => ({ /* store */ }),
  {
    name: 'auth-storage',  // LocalStorage key
    partialize: (state) => ({  // Only persist specific fields
      user: state.user,
      session: state.session,
    }),
  }
)
```

**2. `devtools` Middleware**
```typescript
devtools(
  (set, get) => ({ /* store */ }),
  { name: 'AuthStore' }  // Appears in Redux DevTools
)
```

### Using Stores in Components

**❌ Bad: Subscribe to entire store (causes unnecessary re-renders)**
```typescript
const { user, session, isLoading } = useAuthStore();
```

**✅ Good: Selective subscription (only re-renders when `user` changes)**
```typescript
const user = useAuthStore((state) => state.user);
const setUser = useAuthStore((state) => state.setUser);
```

### Example: UI Store

```typescript
// src/stores/uiStore.ts
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark';
  activeModal: string | null;
  filterPanelOpen: boolean;
  toggleTheme: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  toggleFilterPanel: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'light',
        activeModal: null,
        filterPanelOpen: false,

        toggleTheme: () => set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

        openModal: (modalId) => set({ activeModal: modalId }),
        closeModal: () => set({ activeModal: null }),

        toggleFilterPanel: () => set((state) => ({
          filterPanelOpen: !state.filterPanelOpen,
        })),
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({ theme: state.theme }), // Only persist theme
      }
    ),
    { name: 'UIStore' }
  )
);
```

---

## TanStack Query: Server State Management

### Overview

TanStack Query manages **server-side state** fetched from APIs:
- Directory entries (restaurants, hotels, landmarks)
- User profiles
- Media metadata
- Any data from backend API

**Key Features:**
- ✅ Automatic caching
- ✅ Background refetching
- ✅ Optimistic updates
- ✅ Cache invalidation
- ✅ Pagination and infinite scroll

### Query Hook Pattern

```typescript
// src/hooks/queries/useDirectoryEntries.ts
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { directoryEntrySchema } from '@/schemas/directoryEntrySchema';

const directoryEntriesSchema = z.array(directoryEntrySchema);

export function useDirectoryEntries(category?: string) {
  return useQuery({
    queryKey: ['directory', category],  // Unique cache key
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);

      const response = await fetch(`/api/v1/directory/entries?${params}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();

      // Runtime validation with Zod
      return directoryEntriesSchema.parse(data);
    },
    staleTime: 1000 * 60 * 5,   // 5 minutes
    cacheTime: 1000 * 60 * 30,  // 30 minutes
  });
}
```

### Using Query Hooks

```typescript
// In a component
function DirectoryList() {
  const { data, isLoading, isError, error } = useDirectoryEntries('restaurants');

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <div>
      {data?.map(entry => (
        <DirectoryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
```

### Mutation Pattern (Creating/Updating Data)

```typescript
// src/hooks/mutations/useCreateDirectoryEntry.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { directoryEntrySchema } from '@/schemas/directoryEntrySchema';

export function useCreateDirectoryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newEntry: CreateDirectoryEntryInput) => {
      const response = await fetch('/api/v1/directory/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });

      if (!response.ok) throw new Error('Failed to create entry');

      const data = await response.json();
      return directoryEntrySchema.parse(data);
    },

    // Optimistic update
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: ['directory'] });

      const previousEntries = queryClient.getQueryData(['directory']);

      queryClient.setQueryData(['directory'], (old: any) => [
        ...old,
        { ...newEntry, id: 'temp-id' },
      ]);

      return { previousEntries };
    },

    // Rollback on error
    onError: (err, newEntry, context) => {
      queryClient.setQueryData(['directory'], context?.previousEntries);
    },

    // Refetch after success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['directory'] });
    },
  });
}
```

### Cache Key Strategy

**Hierarchical Keys:**
```typescript
['directory']                         // All directory entries
['directory', 'restaurants']          // Restaurant category
['directory', 'entry', slug]          // Specific entry
['user', 'profile', userId]           // User profile
['media', 'metadata', entryId]        // Media metadata
```

**Benefits:**
- Granular cache invalidation
- Predictable cache behavior
- Easy debugging

---

## Zod: Runtime Validation

### Overview

Zod provides **runtime type safety** with TypeScript type inference:
- Form validation (React Hook Form integration)
- API response validation
- Data parsing and transformation

### Schema Pattern

```typescript
// src/schemas/directoryEntrySchema.ts
import { z } from 'zod';

export const directoryEntrySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['restaurant', 'hotel', 'landmark', 'beach']),
  description: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  image: z.string().url().optional(),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Infer TypeScript type from schema
export type DirectoryEntry = z.infer<typeof directoryEntrySchema>;
```

### Form Validation with React Hook Form

```typescript
// src/components/admin/DirectoryEntryForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { directoryEntrySchema } from '@/schemas/directoryEntrySchema';

export function DirectoryEntryForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(directoryEntrySchema),
  });

  const onSubmit = (data) => {
    // Data is validated and type-safe
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}

      <select {...register('category')}>
        <option value="restaurant">Restaurant</option>
        <option value="hotel">Hotel</option>
      </select>
      {errors.category && <span>{errors.category.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

### API Response Validation

```typescript
// Validate API responses in TanStack Query hooks
const response = await fetch('/api/v1/directory/entries');
const data = await response.json();

// This throws if validation fails
const validatedData = directoryEntriesSchema.parse(data);

// Or use safeParse for error handling
const result = directoryEntriesSchema.safeParse(data);
if (!result.success) {
  console.error('Validation failed:', result.error);
  return;
}

const validatedData = result.data;
```

---

## Integration Patterns

### Pattern 1: Combining Client and Server State

```typescript
// Component using both Zustand and TanStack Query
function DirectoryPage() {
  // Client state (Zustand)
  const selectedCategory = useFilterStore((state) => state.selectedCategory);
  const setCategory = useFilterStore((state) => state.setCategory);

  // Server state (TanStack Query)
  const { data, isLoading } = useDirectoryEntries(selectedCategory);

  return (
    <div>
      <select
        value={selectedCategory}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="restaurant">Restaurants</option>
        <option value="hotel">Hotels</option>
      </select>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <DirectoryList entries={data} />
      )}
    </div>
  );
}
```

### Pattern 2: Form with Client State and Mutation

```typescript
function CreateEntryForm() {
  // Zustand for UI state
  const closeModal = useUIStore((state) => state.closeModal);

  // TanStack Query mutation
  const createEntry = useCreateDirectoryEntry();

  // React Hook Form with Zod validation
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(directoryEntrySchema),
  });

  const onSubmit = async (data) => {
    await createEntry.mutateAsync(data);
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## Best Practices

### 1. Selective Zustand Subscriptions

```typescript
// ✅ Good: Only re-renders when user changes
const user = useAuthStore((state) => state.user);

// ❌ Bad: Re-renders on any authStore change
const { user } = useAuthStore();
```

### 2. Query Key Consistency

```typescript
// ✅ Good: Hierarchical and consistent
['directory', 'restaurants']
['directory', 'entry', slug]

// ❌ Bad: Inconsistent naming
['restaurantsList']
['entryDetail', slug]
```

### 3. Zod Schema Reuse

```typescript
// ✅ Good: Reuse base schemas
const createEntrySchema = directoryEntrySchema.omit({ id: true, createdAt: true });

// ❌ Bad: Duplicate schemas
const createEntrySchema = z.object({ name: z.string(), ... });
```

### 4. Error Handling

```typescript
// ✅ Good: Handle all states
const { data, isLoading, isError, error } = useDirectoryEntries();

if (isLoading) return <LoadingSpinner />;
if (isError) return <ErrorMessage error={error} />;

return <DirectoryList entries={data} />;
```

### 5. Cache Invalidation

```typescript
// ✅ Good: Invalidate related queries after mutation
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['directory'] });
}

// ❌ Bad: No cache invalidation (stale data)
onSuccess: () => {
  // Nothing
}
```

---

## Migration Guide

### From Component State to Zustand

**Before:**
```typescript
function MapFilterControl({ filters, setFilters }) {
  // Props drilling 3 levels deep
  return <FilterPanel filters={filters} onChange={setFilters} />;
}
```

**After:**
```typescript
function MapFilterControl() {
  // Direct access to Zustand store
  const filters = useFilterStore((state) => state.filters);
  const setFilters = useFilterStore((state) => state.setFilters);

  return <FilterPanel />;  // No props needed
}
```

### From Direct API Calls to TanStack Query

**Before:**
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('/api/v1/directory/entries')
    .then(res => res.json())
    .then(setData)
    .finally(() => setLoading(false));
}, []);
```

**After:**
```typescript
const { data, isLoading } = useDirectoryEntries();
// Automatic caching, refetching, error handling
```

---

## Troubleshooting

### Issue: Store Not Persisting

**Symptom**: State resets on page reload

**Solution**: Verify persist middleware configuration
```typescript
persist(
  (set) => ({ /* state */ }),
  { name: 'store-name' }  // Must be unique
)
```

### Issue: Stale Cache Data

**Symptom**: UI shows outdated data after mutation

**Solution**: Invalidate queries after mutations
```typescript
queryClient.invalidateQueries({ queryKey: ['directory'] });
```

### Issue: Too Many Re-renders

**Symptom**: Component re-renders excessively

**Solution**: Use selective Zustand subscriptions
```typescript
// Instead of:
const state = useStore();

// Use:
const field = useStore((state) => state.field);
```

---

## Resources

- **Zustand Documentation**: https://docs.pmnd.rs/zustand
- **TanStack Query Documentation**: https://tanstack.com/query/latest
- **Zod Documentation**: https://zod.dev/
- **React Hook Form**: https://react-hook-form.com/

---

**Related Documentation**:
- [`ARCHITECTURE.md`](ARCHITECTURE.md) - System architecture overview
- [`TESTING.md`](TESTING.md) - Testing state management patterns
- [`CLAUDE.md`](../CLAUDE.md) - Main development guide
