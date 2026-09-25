---
paths: apps/web/**
---

# API Client Architecture

## Architecture Overview

```
api-contracts.ts  →  api-factory.ts  →  api.ts (unified export)
  (interface)          (strategy)         ↓
                                      backend-api.ts  /  mock-api.ts
                                        (implementations)
```

## Import Rule

**Always** import from `@/lib/api` — never from `backend-api` or `mock-api` directly:

```typescript
// GOOD
import { getEntriesByCategory, submitDirectoryEntry } from "@/lib/api";

// BAD
import { BackendApiClient } from "@/lib/backend-api";
```

## Adding New API Methods

1. Add method signature to `ApiClient` interface in `api-contracts.ts`
2. Implement in `BackendApiClient` (`backend-api.ts`)
3. Implement in `MockApiClient` (`mock-api.ts`) — can return stub data
4. Export wrapper function from `api.ts`

```typescript
// 1. api-contracts.ts
export interface ApiClient {
  getNewFeature(id: string): Promise<FeatureDto>;
}

// 2. backend-api.ts
async getNewFeature(id: string): Promise<FeatureDto> {
  const response = await fetch(`${env.apiUrl}/api/v1/features/${id}`, {
    next: CacheConfig.INDIVIDUAL_ENTRY,
  });
  if (!response.ok) {
    throw new Error(`API call failed with status: ${response.status}`);
  }
  const payload = (await response.json()) as unknown;
  return this.unwrapApiResponse<FeatureDto>(payload);
}

// 3. api.ts
export async function getNewFeature(id: string): Promise<FeatureDto> {
  return apiClient.getNewFeature(id);
}
```

## Factory Pattern

```typescript
// api-factory.ts
export const getApiClient = (): ApiClient => {
  if (!apiClientInstance) {
    apiClientInstance = env.useMockApi
      ? new MockApiClient()
      : new BackendApiClient();
  }
  return apiClientInstance;
};
```

## ISR Cache Durations

Defined in `CacheConfig` (in `api-contracts.ts`):

```typescript
export const CacheConfig = {
  DIRECTORY_ENTRIES: { revalidate: 3600 },  // 1 hour
  INDIVIDUAL_ENTRY: { revalidate: 1800 },   // 30 minutes
  TOWNS: { revalidate: 3600 },              // 1 hour
  TOWN_STATUS: { revalidate: 1800, tags: ["directory", "towns"] }, // 30 minutes
  MAP_DATA: { cache: "no-store" as const }, // Always fresh
  REACTION_COUNTS: { revalidate: 300 },     // 5 minutes
  RELATED_CONTENT: { revalidate: 300 },     // 5 minutes
  GALLERY: { revalidate: 1800 },            // 30 minutes
} as const;
```

These apply to `fetch` calls. Pages don't export `revalidate`: `cacheComponents` is on, so pages use `"use cache"` + `cacheLife()` (see app-router.md).

## Response Type Mapping

Backend `ApiResult<T>` / `PagedApiResult<T>` maps to frontend types:

```typescript
// Frontend types for paginated responses (api-contracts.ts)
export interface PaginationMetadata {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMetadata | null;
}
```

## Reference

- Contract interface: `apps/web/src/lib/api-contracts.ts`
- Factory: `apps/web/src/lib/api-factory.ts`
- Unified export: `apps/web/src/lib/api.ts`
- Environment config: `apps/web/src/lib/env.ts`
