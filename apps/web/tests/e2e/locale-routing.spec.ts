import { expect, test, type APIRequestContext } from "@playwright/test";

/**
 * Spec 041 T-06 / FR-001 — the locale prefix at the edge.
 *
 * These hold whether or not Portuguese is switched on (`NEXT_PUBLIC_ENABLE_PT`), so
 * they run against the default dev server. The Portuguese journey itself is
 * `portuguese.spec.ts`, which needs the flag.
 */

async function redirectOf(request: APIRequestContext, path: string) {
  const response = await request.get(path, { maxRedirects: 0 });
  const location = response.headers()["location"];
  const url = location ? new URL(location, "http://placeholder") : null;
  return {
    status: response.status(),
    location: url ? `${url.pathname}${url.search}` : null,
  };
}

test.describe("Locale routing", () => {
  for (const [from, to] of [
    ["/en", "/"],
    ["/en/settlements", "/settlements"],
    ["/en/photographs?place=nova-sintra", "/photographs?place=nova-sintra"],
  ] as const) {
    test(`${from} moves permanently to ${to}`, async ({ request }) => {
      expect(await redirectOf(request, from)).toEqual({
        status: 308,
        location: to,
      });
    });
  }

  test("an English address is served where it always was", async ({
    request,
  }) => {
    expect(await redirectOf(request, "/settlements")).toEqual({
      status: 200,
      location: null,
    });
  });

  for (const [from, to] of [
    ["/pt/admin", "/admin"],
    ["/pt/admin/stories", "/admin/stories"],
    ["/pt/sandbox/x", "/sandbox/x"],
  ] as const) {
    test(`${from} redirects to the unprefixed ${to}`, async ({ request }) => {
      expect(await redirectOf(request, from)).toEqual({
        status: 307,
        location: to,
      });
    });
  }

  test("the admin guard still runs for an address that looks like a file", async ({
    request,
  }) => {
    const { status, location } = await redirectOf(request, "/admin/x.json");

    expect(status).toBe(307);
    expect(location).toBe("/login?returnUrl=%2Fadmin%2Fx.json");
  });

  test("an address that matches no route is a 404", async ({ request }) => {
    const response = await request.get("/a/b/c/d", { maxRedirects: 0 });

    expect(response.status()).toBe(404);
  });
});
