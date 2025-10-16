/**
 * Vitest setup file for Nos Ilha modular architecture testing
 * Configures global test environment for React 19 components
 */
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Set up required environment variables for testing
process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080";
process.env.NEXT_PUBLIC_USE_MOCK_API = "false";
process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = "pk.test_mapbox_token";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test-project.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test_supabase_anon_key";

// Cleanup after each test to ensure test isolation
afterEach(() => {
  cleanup();
});

// Mock Next.js router for component testing
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));
