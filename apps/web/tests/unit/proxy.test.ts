// @vitest-environment node
import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();
const createServerClient = vi.fn(() => ({ auth: { getSession } }));

vi.mock("@supabase/ssr", () => ({ createServerClient }));

const ORIGIN = "https://nosilha.com";

function request(path: string, cookie?: string) {
  return new NextRequest(`${ORIGIN}${path}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

/** A JWT whose payload carries the given app role; the proxy never verifies it. */
function sessionWithRole(role: string) {
  const payload = Buffer.from(JSON.stringify({ user_role: role })).toString(
    "base64"
  );
  return { access_token: `header.${payload}.signature` };
}

/** `PORTUGUESE_ENABLED` is read once at module load, so each case loads afresh. */
async function loadProxy(portuguese: boolean) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_ENABLE_PT", portuguese ? "true" : "false");
  return import("@/proxy");
}

function location(response: Response) {
  const header = response.headers.get("location");
  if (!header) return null;
  const url = new URL(header);
  return `${url.pathname}${url.search}`;
}

const rewrite = (response: Response) =>
  response.headers.get("x-middleware-rewrite");

beforeEach(() => {
  getSession.mockResolvedValue({ data: { session: null } });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

/** Spec 041 T-03 — the order of steps in `plan.md` "Proxy". */
describe("proxy", () => {
  describe("public addresses", () => {
    it("serves an unprefixed address from the English tree, without Supabase", async () => {
      const { proxy } = await loadProxy(true);

      const response = await proxy(request("/settlements"));

      expect(response.status).toBe(200);
      expect(rewrite(response)).toBe(`${ORIGIN}/en/settlements`);
      expect(createServerClient).not.toHaveBeenCalled();
    });

    it("serves a Portuguese address as it is, without Supabase", async () => {
      const { proxy } = await loadProxy(true);

      const response = await proxy(request("/pt/settlements"));

      expect(response.status).toBe(200);
      expect(location(response)).toBeNull();
      expect(rewrite(response)).toBeNull();
      expect(createServerClient).not.toHaveBeenCalled();
    });

    it("does not treat a longer first segment as the admin area", async () => {
      const { proxy } = await loadProxy(true);

      await proxy(request("/administrator"));
      await proxy(request("/sandbox-town"));

      expect(createServerClient).not.toHaveBeenCalled();
    });
  });

  describe("/en", () => {
    it.each([
      ["/en", "/"],
      ["/en/settlements", "/settlements"],
      ["/en/photographs?town=nova-sintra", "/photographs?town=nova-sintra"],
    ])("redirects %s permanently to %s", async (from, to) => {
      const { proxy } = await loadProxy(true);

      const response = await proxy(request(from));

      expect(response.status).toBe(308);
      expect(location(response)).toBe(to);
    });

    it("leaves a town whose name starts with `en` alone", async () => {
      const { proxy } = await loadProxy(true);

      const response = await proxy(request("/encosta"));

      expect(location(response)).toBeNull();
    });
  });

  describe("guarded areas", () => {
    it.each([
      ["/pt/admin/x", "/admin/x"],
      ["/pt/admin", "/admin"],
      ["/en/admin/x", "/admin/x"],
      ["/pt/sandbox/x", "/sandbox/x"],
      ["/pt/admin/x.json", "/admin/x.json"],
    ])("redirects %s to %s", async (from, to) => {
      const { proxy } = await loadProxy(true);

      const response = await proxy(request(from));

      expect(response.status).toBe(307);
      expect(location(response)).toBe(to);
      expect(createServerClient).not.toHaveBeenCalled();
    });

    it("redirects a prefixed admin address while Portuguese is off too", async () => {
      const { proxy } = await loadProxy(false);

      const response = await proxy(request("/pt/admin/x"));

      expect(location(response)).toBe("/admin/x");
    });

    it.each(["/admin", "/admin/stories", "/admin/x.json", "/sandbox/x"])(
      "sends a signed-out visitor from %s to login",
      async (path) => {
        const { proxy } = await loadProxy(true);

        const response = await proxy(request(path));

        expect(createServerClient).toHaveBeenCalledTimes(1);
        expect(location(response)).toBe(
          `/login?returnUrl=${encodeURIComponent(path)}`
        );
      }
    );

    it("sends a signed-in visitor without the admin role home", async () => {
      getSession.mockResolvedValue({
        data: { session: sessionWithRole("USER") },
      });
      const { proxy } = await loadProxy(true);

      const response = await proxy(request("/admin/x.json"));

      expect(location(response)).toBe("/");
    });

    it("lets an admin through", async () => {
      getSession.mockResolvedValue({
        data: { session: sessionWithRole("admin") },
      });
      const { proxy } = await loadProxy(true);

      const response = await proxy(request("/admin/stories"));

      expect(response.status).toBe(200);
      expect(location(response)).toBeNull();
      expect(rewrite(response)).toBeNull();
    });

    it("lets any signed-in visitor into the sandbox", async () => {
      getSession.mockResolvedValue({
        data: { session: sessionWithRole("USER") },
      });
      const { proxy } = await loadProxy(true);

      const response = await proxy(request("/sandbox/x"));

      expect(location(response)).toBeNull();
    });
  });

  describe("the remembered language", () => {
    it("sends a visitor who chose Portuguese from / to /pt", async () => {
      const { proxy } = await loadProxy(true);

      const response = await proxy(request("/", "nosilha-lang=pt"));

      expect(response.status).toBe(307);
      expect(location(response)).toBe("/pt");
    });

    it.each(["nosilha-lang=en", "nosilha-lang=kea", undefined])(
      "does not redirect / for cookie %s",
      async (cookie) => {
        const { proxy } = await loadProxy(true);

        const response = await proxy(request("/", cookie));

        expect(location(response)).toBeNull();
      }
    );

    it("never redirects any other English address", async () => {
      const { proxy } = await loadProxy(true);

      const response = await proxy(request("/settlements", "nosilha-lang=pt"));

      expect(location(response)).toBeNull();
    });

    it("ignores the cookie while Portuguese is off", async () => {
      const { proxy } = await loadProxy(false);

      const response = await proxy(request("/", "nosilha-lang=pt"));

      expect(location(response)).toBeNull();
    });
  });

  describe("while Portuguese is off", () => {
    it("reads /pt as an English address, where it is a reserved slug", async () => {
      const { proxy } = await loadProxy(false);

      const response = await proxy(request("/pt/settlements"));

      expect(rewrite(response)).toBe(`${ORIGIN}/en/pt/settlements`);
    });
  });
});

describe("proxy matcher", () => {
  async function matches(path: string) {
    const { config } = await loadProxy(true);
    return unstable_doesMiddlewareMatch({ config, url: path });
  }

  it.each([
    "/",
    "/settlements",
    "/pt",
    "/pt/photographs/abc",
    "/nova-sintra/igreja",
    // Excluded prefixes are whole segments.
    "/apiary",
    "/directory-of-x",
    "/administrator",
  ])("runs for %s", async (path) => {
    expect(await matches(path)).toBe(true);
  });

  // The proxy is the only admin gate. A single matcher that skips files skipped
  // these too (found in the spike).
  it.each([
    "/admin",
    "/admin/stories",
    "/admin/x.json",
    "/sandbox/x.json",
    "/pt/admin/x.json",
    "/en/sandbox/x.json",
  ])("runs the guard for %s", async (path) => {
    expect(await matches(path)).toBe(true);
  });

  it.each([
    "/_next/static/chunks/main.js",
    "/api/health",
    "/auth/callback",
    "/directory/heritage/igreja",
    "/pagefind/pagefind.js",
    "/sitemap.xml",
    "/robots.txt",
    "/favicon.ico",
    "/images/og-image.jpg",
  ])("does not run for %s", async (path) => {
    expect(await matches(path)).toBe(false);
  });
});
