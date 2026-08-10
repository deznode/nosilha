// design-sync shim for `@/lib/env`.
//
// The real module reads process.env.NEXT_PUBLIC_* in a module-scope IIFE and
// throws when they are absent. esbuild only defines process.env.NODE_ENV for
// the bundle, so the remaining reads reach the browser verbatim and the whole
// IIFE dies with "process is not defined" — which takes down the entire
// bundle before window.NosIlha is ever assigned, not just the one component.
//
// It reaches preview cards through api-factory -> use-bookmarks ->
// BookmarkButton -> DirectoryCard / ListViewCard.
//
// Static development-shaped values; nothing in a preview card performs real
// I/O (the query client is configured with retry: false).
//
// Wired via compilerOptions.paths in .design-sync/tsconfig.sync.json.

interface EnvironmentConfig {
  apiUrl: string;
  useMockApi: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  nodeEnv: "development" | "production" | "test";
  isProd: boolean;
  isDev: boolean;
  isTest: boolean;
}

export const env: EnvironmentConfig = {
  apiUrl: "http://localhost:8080",
  useMockApi: true,
  supabaseUrl: "https://design-sync.invalid",
  supabaseAnonKey: "design-sync-preview",
  nodeEnv: "development",
  isProd: false,
  isDev: true,
  isTest: false,
};

export const isBrowser = typeof window !== "undefined";
export const isServer = !isBrowser;

export function getEnvironmentName(): string {
  return "development";
}

export function isDebugEnabled(): boolean {
  return false;
}

export function getApiBaseUrl(): string {
  return env.apiUrl;
}

export function getApiEndpoint(path: string): string {
  return `${env.apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function validateEnvironment(): { valid: boolean; errors: string[] } {
  return { valid: true, errors: [] };
}

export function logEnvironmentInfo(): void {}

export type { EnvironmentConfig };
