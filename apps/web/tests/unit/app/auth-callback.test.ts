import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Spec 039 T-11 — the auth callback honours a safe `next`:
 * - a successful code exchange redirects to `safeNext(next)` on the
 *   forwarded host in production, or the origin in dev
 * - a missing/unsafe `next` falls back to "/"
 * - an OAuth `?error=` with a safe `next` present goes back to that `next`
 *   with `auth_error=1` (so the contribute page can show S10), instead of
 *   the generic /login?error= page
 */

const mocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  cookieStore: {
    getAll: vi.fn(() => []),
    set: vi.fn(),
  },
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession: mocks.exchangeCodeForSession,
    },
  })),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => mocks.cookieStore),
}));

import { GET } from "@/app/auth/callback/route";

function callbackRequest(
  params: Record<string, string>,
  headers?: Record<string, string>
): Request {
  const url = new URL("https://nosilha.com/auth/callback");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url, { headers });
}

describe("GET /auth/callback", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.exchangeCodeForSession.mockReset();
    mocks.cookieStore.getAll.mockReset().mockReturnValue([]);
    mocks.cookieStore.set.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("successful exchange", () => {
    it("redirects to the origin root when next is missing (dev)", async () => {
      vi.stubEnv("NODE_ENV", "development");
      mocks.exchangeCodeForSession.mockResolvedValue({ error: null });

      const response = await GET(callbackRequest({ code: "abc123" }));

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("https://nosilha.com/");
    });

    it("redirects to a safe next path on the origin (dev)", async () => {
      vi.stubEnv("NODE_ENV", "development");
      mocks.exchangeCodeForSession.mockResolvedValue({ error: null });

      const response = await GET(
        callbackRequest({
          code: "abc123",
          next: "/contribute/media?resume=1",
        })
      );

      expect(response.headers.get("location")).toBe(
        "https://nosilha.com/contribute/media?resume=1"
      );
    });

    it("falls back to / for an unsafe next (protocol-relative)", async () => {
      vi.stubEnv("NODE_ENV", "development");
      mocks.exchangeCodeForSession.mockResolvedValue({ error: null });

      const response = await GET(
        callbackRequest({ code: "abc123", next: "//evil.com" })
      );

      expect(response.headers.get("location")).toBe("https://nosilha.com/");
    });

    it("falls back to / for an unsafe next (absolute URL)", async () => {
      vi.stubEnv("NODE_ENV", "development");
      mocks.exchangeCodeForSession.mockResolvedValue({ error: null });

      const response = await GET(
        callbackRequest({ code: "abc123", next: "https://evil.com" })
      );

      expect(response.headers.get("location")).toBe("https://nosilha.com/");
    });

    it("redirects to the forwarded host with the safe next in production", async () => {
      vi.stubEnv("NODE_ENV", "production");
      mocks.exchangeCodeForSession.mockResolvedValue({ error: null });

      const response = await GET(
        callbackRequest(
          { code: "abc123", next: "/contribute/media?resume=1" },
          { "x-forwarded-host": "nosilha.com" }
        )
      );

      expect(response.headers.get("location")).toBe(
        "https://nosilha.com/contribute/media?resume=1"
      );
    });

    it("redirects to the request origin in production without a forwarded host", async () => {
      vi.stubEnv("NODE_ENV", "production");
      mocks.exchangeCodeForSession.mockResolvedValue({ error: null });

      const response = await GET(
        callbackRequest({ code: "abc123", next: "/contribute/media" })
      );

      expect(response.headers.get("location")).toBe(
        "https://nosilha.com/contribute/media"
      );
    });
  });

  describe("exchange error", () => {
    it("keeps the existing /login?error= behaviour", async () => {
      mocks.exchangeCodeForSession.mockResolvedValue({
        error: { message: "invalid code" },
      });

      const response = await GET(
        callbackRequest({ code: "bad-code", next: "/contribute/media" })
      );

      const location = new URL(response.headers.get("location")!);
      expect(location.pathname).toBe("/login");
      expect(location.searchParams.get("error")).toBe("invalid code");
    });
  });

  describe("OAuth provider error (?error=)", () => {
    it("returns to a safe next with auth_error=1 instead of /login", async () => {
      const response = await GET(
        callbackRequest({
          error: "access_denied",
          error_description: "The user cancelled Google sign-in",
          next: "/contribute/media?resume=1",
        })
      );

      const location = new URL(response.headers.get("location")!);
      expect(location.pathname).toBe("/contribute/media");
      expect(location.searchParams.get("resume")).toBe("1");
      expect(location.searchParams.get("auth_error")).toBe("1");
    });

    it("falls back to /login?error= when next is absent", async () => {
      const response = await GET(
        callbackRequest({
          error: "access_denied",
          error_description: "The user cancelled Google sign-in",
        })
      );

      const location = new URL(response.headers.get("location")!);
      expect(location.pathname).toBe("/login");
      expect(location.searchParams.get("error")).toBe(
        "The user cancelled Google sign-in"
      );
      expect(location.searchParams.get("auth_error")).toBeNull();
    });

    it("falls back to /login?error= when next is unsafe", async () => {
      const response = await GET(
        callbackRequest({
          error: "access_denied",
          error_description: "The user cancelled Google sign-in",
          next: "https://evil.com",
        })
      );

      const location = new URL(response.headers.get("location")!);
      expect(location.pathname).toBe("/login");
      expect(location.searchParams.get("auth_error")).toBeNull();
    });
  });

  describe("neither code nor error", () => {
    it("redirects home", async () => {
      const response = await GET(callbackRequest({}));

      expect(response.headers.get("location")).toBe("https://nosilha.com/");
    });
  });
});
