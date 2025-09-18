/**
 * Centralized environment configuration and validation
 * This file ensures all environment variables are properly typed and validated
 */

// ================================
// ENVIRONMENT VARIABLE TYPES
// ================================

interface EnvironmentConfig {
  // API Configuration
  apiUrl: string;

  // Third-party Services
  mapboxAccessToken: string;
  supabaseUrl: string;
  supabaseAnonKey: string;

  // Application Configuration
  nodeEnv: "development" | "production" | "test";
  isProd: boolean;
  isDev: boolean;
  isTest: boolean;
}

// ================================
// ENVIRONMENT VALIDATION
// ================================

/**
 * Validates that a required environment variable is present and non-empty
 */
function requireEnvVar(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Please check your .env.local file and ensure ${name} is defined.`
    );
  }
  return value.trim();
}

/**
 * Gets an optional environment variable with a default value
 */
function getOptionalEnvVar(
  name: string,
  defaultValue: string,
  value?: string
): string {
  return value && value.trim() !== "" ? value.trim() : defaultValue;
}

/**
 * Validates NODE_ENV and returns normalized value
 */
function validateNodeEnv(
  nodeEnv?: string
): "development" | "production" | "test" {
  const env = nodeEnv?.toLowerCase();

  if (env === "production" || env === "prod") {
    return "production";
  }
  if (env === "test") {
    return "test";
  }
  // Default to development for any other value (including undefined)
  return "development";
}

// ================================
// ENVIRONMENT CONFIGURATION
// ================================

/**
 * Centralized environment configuration with validation
 * All environment variables are validated at module load time
 */
export const env: EnvironmentConfig = (() => {
  try {
    // Validate NODE_ENV
    const nodeEnv = validateNodeEnv(process.env.NODE_ENV);

    // Required environment variables
    const apiUrl = requireEnvVar(
      "NEXT_PUBLIC_API_URL",
      process.env.NEXT_PUBLIC_API_URL
    );
    const mapboxAccessToken = requireEnvVar(
      "NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN",
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    );
    const supabaseUrl = requireEnvVar(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL
    );
    const supabaseAnonKey = requireEnvVar(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Derived environment flags
    const isProd = nodeEnv === "production";
    const isDev = nodeEnv === "development";
    const isTest = nodeEnv === "test";

    // Validate API URL format
    try {
      new URL(apiUrl);
    } catch {
      throw new Error(
        `Invalid NEXT_PUBLIC_API_URL format: "${apiUrl}". ` +
          `Please provide a valid URL (e.g., "http://localhost:8080" or "https://api.example.com")`
      );
    }

    // Validate Supabase URL format
    try {
      new URL(supabaseUrl);
    } catch {
      throw new Error(
        `Invalid NEXT_PUBLIC_SUPABASE_URL format: "${supabaseUrl}". ` +
          `Please provide a valid Supabase project URL.`
      );
    }

    // Validate Mapbox token format (basic check)
    if (!mapboxAccessToken.startsWith("pk.")) {
      console.warn(
        `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN does not start with "pk." - this might not be a valid Mapbox public token.`
      );
    }

    return {
      apiUrl,
      mapboxAccessToken,
      supabaseUrl,
      supabaseAnonKey,
      nodeEnv,
      isProd,
      isDev,
      isTest,
    };
  } catch (error) {
    // In development, log the error and provide helpful guidance
    if (process.env.NODE_ENV !== "production") {
      console.error("❌ Environment Configuration Error:");
      console.error(error instanceof Error ? error.message : String(error));
      console.error("");
      console.error("💡 Quick Fix:");
      console.error("1. Create a .env.local file in your project root");
      console.error("2. Add the missing environment variables:");
      console.error("");
      console.error("NEXT_PUBLIC_API_URL=http://localhost:8080");
      console.error(
        "NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here"
      );
      console.error(
        "NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
      );
      console.error(
        "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here"
      );
      console.error("");
      console.error("3. Restart your development server");
      console.error("");
    }

    // Re-throw to prevent the app from starting with invalid configuration
    throw error;
  }
})();

// ================================
// ENVIRONMENT UTILITIES
// ================================

/**
 * Check if we're running in a browser environment
 */
export const isBrowser = typeof window !== "undefined";

/**
 * Check if we're running in a server environment
 */
export const isServer = !isBrowser;

/**
 * Get the current environment name for display
 */
export function getEnvironmentName(): string {
  return env.nodeEnv;
}

/**
 * Check if current environment allows debug logging
 */
export function isDebugEnabled(): boolean {
  return env.isDev || env.isTest;
}

/**
 * Get API base URL with trailing slash removed
 */
export function getApiBaseUrl(): string {
  return env.apiUrl.replace(/\/$/, "");
}

/**
 * Get full API endpoint URL
 */
export function getApiEndpoint(path: string): string {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Validate environment configuration on demand
 * Useful for health checks or startup validation
 */
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    // Test API URL accessibility (basic URL validation)
    new URL(env.apiUrl);
  } catch {
    errors.push(`Invalid API URL: ${env.apiUrl}`);
  }

  try {
    // Test Supabase URL accessibility
    new URL(env.supabaseUrl);
  } catch {
    errors.push(`Invalid Supabase URL: ${env.supabaseUrl}`);
  }

  // Check for required tokens
  if (!env.mapboxAccessToken) {
    errors.push("Missing Mapbox access token");
  }

  if (!env.supabaseAnonKey) {
    errors.push("Missing Supabase anonymous key");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Log environment configuration (safe for production - no secrets)
 */
export function logEnvironmentInfo(): void {
  if (env.isProd) {
    console.log("🌍 Environment: Production");
    return;
  }

  console.log("🌍 Environment Configuration:");
  console.log(`  - Environment: ${env.nodeEnv}`);
  console.log(`  - API URL: ${env.apiUrl}`);
  console.log(`  - Supabase URL: ${env.supabaseUrl}`);
  console.log(`  - Mapbox Token: ${env.mapboxAccessToken.substring(0, 20)}...`);
  console.log(`  - Browser: ${isBrowser}`);
  console.log(`  - Server: ${isServer}`);
}

// ================================
// TYPE EXPORTS
// ================================

export type { EnvironmentConfig };
