import { env } from "@/lib/env";
import type { ApiClient, ApiClientFactory } from "@/lib/api-contracts";
import { BackendApiClient } from "@/lib/backend-api";
import { MockApiClient } from "@/lib/mock-api";

/**
 * API Factory - Creates the appropriate API client based on environment configuration
 *
 * This factory implements the Strategy Pattern to dynamically select between
 * backend and mock API implementations at runtime based on environment variables.
 */

/**
 * Creates and returns the appropriate API client instance
 * based on the NEXT_PUBLIC_USE_MOCK_API environment variable.
 *
 * @returns {ApiClient} The configured API client (Backend or Mock)
 */
export const createApiClient: ApiClientFactory = (): ApiClient => {
  if (env.useMockApi) {
    console.log("🎭 API Factory: Using Mock API Client");
    return new MockApiClient();
  } else {
    console.log("🌐 API Factory: Using Backend API Client");
    return new BackendApiClient();
  }
};

/**
 * Singleton API client instance
 * Created once at module load time for optimal performance
 */
let apiClientInstance: ApiClient | null = null;

/**
 * Gets the singleton API client instance.
 * Creates it on first access using the factory pattern.
 *
 * @returns {ApiClient} The singleton API client instance
 */
export const getApiClient = (): ApiClient => {
  if (!apiClientInstance) {
    apiClientInstance = createApiClient();

    // Log configuration in development
    if (env.isDev) {
      console.log("📊 API Configuration:", {
        useMockApi: env.useMockApi,
        apiUrl: env.apiUrl,
        implementation: env.useMockApi ? "Mock" : "Backend",
      });
    }
  }

  return apiClientInstance;
};

/**
 * Forces recreation of the API client instance.
 * Useful for testing or when environment configuration changes.
 */
export const resetApiClient = (): void => {
  console.log("🔄 API Factory: Resetting API client instance");
  apiClientInstance = null;
};

/**
 * Gets the current API implementation type
 *
 * @returns {"backend" | "mock"} The current API implementation type
 */
export const getApiImplementationType = (): "backend" | "mock" => {
  return env.useMockApi ? "mock" : "backend";
};

/**
 * Checks if the current configuration is using mock API
 *
 * @returns {boolean} True if using mock API, false if using backend API
 */
export const isUsingMockApi = (): boolean => {
  return env.useMockApi;
};

/**
 * Utility function to log API configuration for debugging
 */
export const logApiConfiguration = (): void => {
  console.group("🏗️ API Factory Configuration");
  console.log("Environment:", env.nodeEnv);
  console.log("Use Mock API:", env.useMockApi);
  console.log("API URL:", env.apiUrl);
  console.log("Implementation:", getApiImplementationType());
  console.log(
    "Client Instance:",
    apiClientInstance ? "Created" : "Not Created"
  );
  console.groupEnd();
};

// Export types for TypeScript support
export type { ApiClient, ApiClientFactory } from "@/lib/api-contracts";
