/**
 * TanStack Query hook for monitoring system health.
 * Polls Spring Boot Actuator health endpoint every 30 seconds.
 */

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { adminKeys } from "./keys";

/**
 * System health status response from Spring Boot Actuator
 */
export interface SystemHealthResponse {
  status: "UP" | "DOWN" | "OUT_OF_SERVICE" | "UNKNOWN";
  components?: {
    db?: {
      status: "UP" | "DOWN" | "UNKNOWN";
      details?: Record<string, unknown>;
    };
    ping?: {
      status: "UP" | "DOWN" | "UNKNOWN";
    };
  };
}

/**
 * Simplified system status for UI display
 */
export interface SystemStatus {
  database: "connected" | "disconnected" | "unknown";
  mdxEngine: "active" | "inactive" | "unknown";
}

/**
 * Hook for monitoring system health with real-time polling.
 * Fetches data from Spring Boot Actuator /actuator/health endpoint.
 *
 * @param options Additional TanStack Query options
 * @returns Query result with system status, loading, error states
 */
export function useSystemHealth(
  options?: Omit<UseQueryOptions<SystemStatus, Error>, "queryKey" | "queryFn">
) {
  return useQuery<SystemStatus, Error>({
    queryKey: adminKeys.system.health(),
    queryFn: async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const response = await fetch(`${apiUrl}/actuator/health`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          // If actuator endpoint is not available, return unknown status
          return {
            database: "unknown" as const,
            mdxEngine: "unknown" as const,
          };
        }

        const healthData: SystemHealthResponse = await response.json();

        // Parse database status from components
        const dbStatus = healthData.components?.db?.status;
        const database: SystemStatus["database"] =
          dbStatus === "UP"
            ? "connected"
            : dbStatus === "DOWN"
              ? "disconnected"
              : "unknown";

        // Parse MDX engine status (consider system UP as engine active)
        // In future, this could check a specific component for MDX engine
        const mdxEngine: SystemStatus["mdxEngine"] =
          healthData.status === "UP"
            ? "active"
            : healthData.status === "DOWN"
              ? "inactive"
              : "unknown";

        return {
          database,
          mdxEngine,
        };
      } catch (error) {
        console.error("Failed to fetch system health:", error);
        // Return unknown status on error to avoid breaking UI
        return {
          database: "unknown" as const,
          mdxEngine: "unknown" as const,
        };
      }
    },
    staleTime: 0, // Always consider data stale to ensure fresh polling
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    refetchIntervalInBackground: true, // Continue polling in background
    retry: 3, // Retry failed requests up to 3 times
    ...options,
  });
}
