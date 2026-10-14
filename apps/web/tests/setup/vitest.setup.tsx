/**
 * Vitest setup file for Nos Ilha modular architecture testing
 * Configures global test environment for React 19 components
 */
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Mock localStorage/sessionStorage for Zustand persist middleware
// jsdom's localStorage doesn't fully support Zustand's persist interface
class LocalStorageMock implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
}

// Set up storage mocks globally. Vitest 5 exposes these as getter-only
// properties, so plain assignment throws; redefine them instead.
for (const name of ["localStorage", "sessionStorage"] as const) {
  Object.defineProperty(globalThis, name, {
    value: new LocalStorageMock(),
    configurable: true,
    writable: true,
  });
}

// Set up required environment variables for testing
process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080";
process.env.NEXT_PUBLIC_USE_MOCK_API = "false";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test-project.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test_supabase_anon_key";

// Cleanup after each test to ensure test isolation
afterEach(() => {
  cleanup();
  // Clear storage between tests to prevent state leakage
  localStorage.clear();
  sessionStorage.clear();
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

// Locale-aware navigation (spec 041). `@/i18n/navigation` is mapped back onto
// `next/link` and `next/navigation`, so a test that mocks either of those keeps
// working unchanged. Each call is forwarded when it is made, because a test's own
// partial mock of `next/navigation` may define only the hooks it uses.
vi.mock("@/i18n/navigation", async () => {
  const navigation = await import("next/navigation");
  const { default: NextLink } = await import("next/link");
  const { withLocale } = await import("@/i18n/paths");
  return {
    Link: NextLink,
    useRouter: () => navigation.useRouter(),
    usePathname: () => navigation.usePathname(),
    redirect: ({ href }: { href: string }) => navigation.redirect(href),
    getPathname: ({ href, locale }: { href: string; locale: string }) =>
      withLocale(href, locale),
  };
});

// Messages come from the real English file through a real translator, so an English
// assertion fails if the wording in `messages/en.json` drifts from what it replaced.
vi.mock("next-intl", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next-intl")>();
  const { default: messages } = await import("../../messages/en.json");
  const intl = { locale: "en", timeZone: "UTC" } as const;
  return {
    ...actual,
    useLocale: () => intl.locale,
    useTranslations: (namespace?: string) =>
      actual.createTranslator({ ...intl, messages, namespace } as any),
    useFormatter: () => actual.createFormatter(intl),
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
      children,
  };
});

vi.mock("next-intl/server", async () => {
  const { createFormatter, createTranslator } = await import("next-intl");
  const { default: messages } = await import("../../messages/en.json");
  const intl = { locale: "en", timeZone: "UTC" } as const;
  return {
    getLocale: async () => intl.locale,
    getMessages: async () => messages,
    getTranslations: async (
      options?: string | { namespace?: string; locale?: string }
    ) =>
      createTranslator({
        ...intl,
        messages,
        namespace: typeof options === "string" ? options : options?.namespace,
      } as any),
    getFormatter: async () => createFormatter(intl),
    setRequestLocale: () => {},
  };
});

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
  // The `<img>` props as the loader would build them, without the loader.
  getImageProps: ({ src, alt, sizes }: any) => ({
    props: { src, alt, sizes, srcSet: undefined },
  }),
}));
