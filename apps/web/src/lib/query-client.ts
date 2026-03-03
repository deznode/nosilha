import { QueryClient } from "@tanstack/react-query";

/**
 * TanStack Query client configuration for Nos Ilha.
 * Provides centralized query caching and fetching behavior.
 */

export const queryClientConfig = {
  defaultOptions: {
    queries: {
      // Stale time: how long data is considered fresh
      staleTime: 60 * 1000, // 1 minute default
      // GC time: how long unused data stays in cache
      gcTime: 5 * 60 * 1000, // 5 minutes default (formerly cacheTime)
      // Retry failed requests
      retry: 1,
      // Refetch on window focus for real-time data
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Refetch on mount if data is stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations
      retry: 1,
    },
  },
};

/**
 * Creates a new QueryClient instance with Nos Ilha configuration.
 * Use this in providers and server components.
 */
export function createQueryClient() {
  return new QueryClient(queryClientConfig);
}

/**
 * Singleton QueryClient instance for client-side usage.
 * This ensures we don't create multiple clients on the client.
 */
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  // Server: always create a new query client
  if (typeof window === "undefined") {
    return createQueryClient();
  }

  // Browser: create the query client once
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }

  return browserQueryClient;
}
