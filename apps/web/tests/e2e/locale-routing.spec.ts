import {
  expect,
  test,
  type APIRequestContext,
  type BrowserContext,
  type Page,
} from "@playwright/test";

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

/**
 * Spec 041 T-21 / FR-003 — the language control and the remembered choice.
 *
 * Needs a server built or started with `NEXT_PUBLIC_ENABLE_PT=true`; skipped
 * otherwise (with the flag off `/pt` is not found). The spec names a photograph
 * page for "the same page", but the mock API has no photographs, so the map with a
 * query string stands in: it proves the same thing, the path and the query kept.
 *
 * At the default Desktop Chrome width only the desktop bar is displayed, so the
 * role queries below find its control and no other.
 */
async function portugueseEnabled(request: APIRequestContext) {
  const response = await request.get("/pt", { maxRedirects: 0 });
  return response.status() === 200;
}

async function languageCookie(context: BrowserContext) {
  const cookies = await context.cookies();
  return cookies.find((cookie) => cookie.name === "nosilha-lang")?.value;
}

/** The address the page is on, without origin, once it settles there. */
async function expectAddress(page: Page, address: string) {
  await expect
    .poll(() => {
      const url = new URL(page.url());
      return `${url.pathname}${url.search}`;
    })
    .toBe(address);
}

function languageLink(page: Page, name: "English" | "Português") {
  return page
    .getByRole("navigation", { name: /^(Language|Idioma)$/ })
    .getByRole("link", { name, exact: true });
}

test.describe("Language control", () => {
  test.beforeEach(async ({ request }) => {
    test.skip(
      !(await portugueseEnabled(request)),
      "Portuguese is off (NEXT_PUBLIC_ENABLE_PT)"
    );
  });

  test("choosing Portuguese opens the same page under /pt and is remembered for /", async ({
    page,
    context,
  }) => {
    await page.goto("/map?mode=records");
    await expect(languageLink(page, "English")).toHaveAttribute(
      "aria-current",
      "true"
    );

    await languageLink(page, "Português").click();

    await expectAddress(page, "/pt/map?mode=records");
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-PT");
    await expect(languageLink(page, "Português")).toHaveAttribute(
      "aria-current",
      "true"
    );
    expect(await languageCookie(context)).toBe("pt");

    // The bare home address follows the choice; no other English address does.
    await page.goto("/");
    await expectAddress(page, "/pt");

    await page.goto("/settlements");
    await expectAddress(page, "/settlements");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("choosing English clears the redirect", async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([
      { name: "nosilha-lang", value: "pt", url: baseURL! },
    ]);

    await page.goto("/pt/settlements");
    await languageLink(page, "English").click();

    await expectAddress(page, "/settlements");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(await languageCookie(context)).toBe("en");

    await page.goto("/");
    await expectAddress(page, "/");
  });

  test("arriving on a /pt link without the control remembers nothing", async ({
    page,
    context,
  }) => {
    await page.goto("/pt/settlements");
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-PT");

    expect(await languageCookie(context)).toBeUndefined();
  });
});
