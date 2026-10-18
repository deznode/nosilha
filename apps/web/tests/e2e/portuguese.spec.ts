import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

/**
 * Spec 041 T-23 — the Portuguese journey, the sign-in return, shared links and the
 * tags search engines and chat apps read (FR-001, FR-002, FR-005, FR-006, FR-008).
 *
 * Needs a server built or started with `NEXT_PUBLIC_ENABLE_PT=true`; skipped
 * otherwise (with the flag off `/pt` is not found). Written against the mock API
 * (`NEXT_PUBLIC_USE_MOCK_API=true`): Nova Sintra and its place records exist there,
 * photographs and films do not.
 */
async function portugueseEnabled(request: APIRequestContext) {
  const response = await request.get("/pt", { maxRedirects: 0 });
  return response.status() === 200;
}

/** The page is on a Portuguese address and the document says so. */
async function expectPortuguese(page: Page, path: RegExp) {
  await expect(page).toHaveURL((url) => path.test(url.pathname));
  expect(new URL(page.url()).pathname).toMatch(/^\/pt(\/|$)/);
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-PT");
}

/**
 * Blocks Supabase and returns the requests attempted, navigations included. Matched
 * on the auth API path as well as the hosted domain, as in `contribute-flow.spec.ts`.
 */
async function blockSupabase(page: Page): Promise<string[]> {
  const calls: string[] = [];
  await page.route(
    (url) =>
      /supabase\.(co|in)$/.test(url.hostname) ||
      url.pathname.includes("/auth/v1/"),
    (route) => {
      calls.push(route.request().url());
      return route.abort();
    }
  );
  return calls;
}

// A 1x1 PNG, enough for the photo input to accept.
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

test.beforeEach(async ({ request }) => {
  test.skip(
    !(await portugueseEnabled(request)),
    "Portuguese is off (NEXT_PUBLIC_ENABLE_PT)"
  );
});

test.describe("Portuguese journey", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("home → settlements → a town → a place record → the map, never leaving /pt", async ({
    page,
  }) => {
    await page.goto("/pt");
    await expectPortuguese(page, /^\/pt$/);

    const banner = page.getByRole("banner");
    await banner
      .getByRole("link", { name: "Localidades", exact: true })
      .first()
      .click();
    await expectPortuguese(page, /^\/pt\/settlements$/);

    // A settlement with records opens its page; a name-only card opens the map with
    // that settlement selected. The mock API's status summary counts no records for
    // any settlement, so there the card opens the map, and nothing else on the site
    // links to the town page: the journey then goes to it by address.
    const card = page
      .getByRole("main")
      .getByRole("link", { name: /^Nova Sintra(\s|$)/ })
      .first();
    const opensTown = (await card.getAttribute("href")) === "/pt/nova-sintra";
    await card.click();
    if (!opensTown) {
      await expectPortuguese(page, /^\/pt\/map$/);
      expect(new URL(page.url()).searchParams.get("sel")).toBe("s:nova-sintra");
      await page.goto("/pt/nova-sintra");
    }
    await expectPortuguese(page, /^\/pt\/nova-sintra$/);

    await page.locator('main a[href^="/pt/nova-sintra/"]').first().click();
    await expectPortuguese(page, /^\/pt\/nova-sintra\/[^/]+$/);

    await banner
      .getByRole("link", { name: "Mapa", exact: true })
      .first()
      .click();
    await expectPortuguese(page, /^\/pt\/map$/);
  });

  test("the photographs index stays under /pt", async ({ page }) => {
    // The spec's journey passes through a photograph, but the mock API has none, so
    // the index stands in: it is reached from the same bar and must stay Portuguese.
    await page.goto("/pt/map");
    await page
      .getByRole("banner")
      .getByRole("link", { name: "Fotografias", exact: true })
      .first()
      .click();
    await expectPortuguese(page, /^\/pt\/photographs$/);
  });
});

test.describe("Signing in from a Portuguese page", () => {
  test.use({ viewport: { width: 1200, height: 900 } });

  test("Google sign-in from /pt/contribute comes back to the /pt form", async ({
    page,
  }) => {
    const supabaseCalls = await blockSupabase(page);

    await page.goto("/pt/contribute");
    await page.getByRole("link", { name: "Envia uma fotografia →" }).click();
    await expectPortuguese(page, /^\/pt\/contribute\/media$/);

    await page.locator("#contribute-photo-file").setInputFiles({
      name: "brava.png",
      mimeType: "image/png",
      buffer: TINY_PNG,
    });
    await page.getByLabel("Quem tirou esta fotografia?").fill("Maria Lopes");
    await page.getByLabel("Quem no-la está a oferecer?").fill("Ana Lopes");
    await page
      .getByRole("checkbox", { name: /Tenho o direito de partilhar isto/ })
      .check();
    await page.getByRole("button", { name: "Enviar para o arquivo" }).click();

    const dialog = page.getByRole("dialog", { name: "Confirma que és tu" });
    await expect(dialog).toBeAttached();
    await dialog
      .getByRole("button", { name: "Continuar com a Google" })
      .click();

    // Leaving for Google is a navigation to Supabase's authorize endpoint, which
    // carries the address the callback sends the reader back to. Completing the
    // round trip needs a real Google account, so the test stops at that address.
    await expect
      .poll(() => supabaseCalls.find((call) => call.includes("/authorize")))
      .toBeTruthy();
    const authorize = new URL(
      supabaseCalls.find((call) => call.includes("/authorize"))!
    );
    const callback = new URL(authorize.searchParams.get("redirect_to")!);
    expect(callback.pathname).toBe("/auth/callback");
    expect(callback.searchParams.get("next")).toBe(
      "/pt/contribute/media?resume=1"
    );
  });

  test("password sign-in on /pt/login returns to the /pt page it was sent from", async ({
    page,
  }) => {
    // Supabase answers locally with a session, so the form's own redirect runs
    // without credentials. Nothing reaches the network.
    const now = Math.floor(Date.now() / 1000);
    const user = {
      id: "00000000-0000-4000-8000-000000000041",
      aud: "authenticated",
      role: "authenticated",
      email: "leitor@example.com",
      app_metadata: { provider: "email" },
      user_metadata: {},
      created_at: "2026-01-01T00:00:00Z",
    };
    const payload = Buffer.from(
      JSON.stringify({ sub: user.id, role: "authenticated", exp: now + 3600 })
    ).toString("base64url");
    await page.route(
      (url) => url.pathname.includes("/auth/v1/"),
      (route) => {
        const url = new URL(route.request().url());
        if (url.pathname.endsWith("/token")) {
          return route.fulfill({
            json: {
              access_token: `eyJhbGciOiJIUzI1NiJ9.${payload}.c2ln`,
              token_type: "bearer",
              expires_in: 3600,
              expires_at: now + 3600,
              refresh_token: "refresh",
              user,
            },
          });
        }
        if (url.pathname.endsWith("/user"))
          return route.fulfill({ json: user });
        return route.abort();
      }
    );

    await page.goto("/pt/login?returnUrl=%2Fcontribute");
    await expectPortuguese(page, /^\/pt\/login$/);

    await page.locator('input[type="email"]').fill("leitor@example.com");
    await page.locator('input[type="password"]').fill("palavra-passe");
    await page.getByRole("button", { name: "Entrar", exact: true }).click();

    await expectPortuguese(page, /^\/pt\/contribute$/);
  });
});

test.describe("Sharing a Portuguese page", () => {
  test("Copy link on a town page sends the /pt address with the share tags", async ({
    page,
    context,
    baseURL,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/pt/nova-sintra");

    await page
      .getByRole("button", { name: "Copiar ligação", exact: true })
      .first()
      .click();
    await expect(page.getByText("Ligação copiada").first()).toBeVisible();

    const copied = new URL(
      await page.evaluate(() => navigator.clipboard.readText())
    );
    expect(copied.origin).toBe(new URL(baseURL!).origin);
    expect(copied.pathname).toBe("/pt/nova-sintra");
    expect(copied.searchParams.get("utm_source")).toBe("share");
    expect(copied.searchParams.get("utm_medium")).toBe("link");
    expect(copied.searchParams.get("utm_campaign")).toBeTruthy();
  });
});

/** Rendered tags, read from the HTML the server sends (no browser). */
async function html(request: APIRequestContext, path: string) {
  const response = await request.get(path);
  expect(response.status()).toBe(200);
  return response.text();
}

function linkHref(source: string, rel: string, hrefLang?: string) {
  const tags = source.match(/<link\b[^>]*>/g) ?? [];
  const tag = tags.find(
    (candidate) =>
      candidate.includes(`rel="${rel}"`) &&
      (hrefLang === undefined || candidate.includes(`hrefLang="${hrefLang}"`))
  );
  return tag?.match(/href="([^"]*)"/)?.[1];
}

function metaContent(source: string, property: string) {
  return source
    .match(new RegExp(`<meta property="${property}" content="([^"]*)"`))
    ?.at(1);
}

test.describe("Rendered tags", () => {
  test("a page in both languages declares its /pt canonical, alternates and og:locale", async ({
    request,
  }) => {
    const source = await html(request, "/pt/nova-sintra");

    expect(source).toMatch(/<html[^>]*\blang="pt-PT"/);
    expect(linkHref(source, "canonical")).toMatch(/\/pt\/nova-sintra$/);
    const en = linkHref(source, "alternate", "en");
    const pt = linkHref(source, "alternate", "pt-PT");
    const fallback = linkHref(source, "alternate", "x-default");
    expect(en).toMatch(/[^/]\/nova-sintra$/);
    expect(en).not.toContain("/pt/");
    expect(pt).toMatch(/\/pt\/nova-sintra$/);
    expect(fallback).toBe(en);
    expect(metaContent(source, "og:locale")).toBe("pt_PT");
  });

  test("a legal page has a canonical, no alternates, and an English body under a Portuguese notice", async ({
    request,
  }) => {
    const source = await html(request, "/pt/privacy");

    expect(linkHref(source, "canonical")).toMatch(/\/pt\/privacy$/);
    expect(source).not.toMatch(/<link\b[^>]*rel="alternate"[^>]*hrefLang=/);
    expect(source).toContain("Esta página só está disponível em inglês.");
    expect(source).toMatch(/<div lang="en">/);
    expect(metaContent(source, "og:locale")).toBe("pt_PT");
  });

  test("a record page keeps the record description in English, marked lang=en", async ({
    request,
  }) => {
    const town = await html(request, "/pt/nova-sintra");
    const entry = town.match(/href="(\/pt\/nova-sintra\/[^"/?]+)"/)?.[1];
    test.skip(!entry, "Nova Sintra has no place record in this archive");

    const source = await html(request, entry!);
    expect(source).toMatch(/<html[^>]*\blang="pt-PT"/);
    expect(linkHref(source, "canonical")).toMatch(
      new RegExp(`${entry!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`)
    );

    // The description shown on the page is the one stored on the record, which
    // the page also sends as its og:description.
    const description = metaContent(source, "og:description");
    expect(description).toBeTruthy();
    const opening = description!.slice(0, 40);
    const wrapped = source.match(/<p\b[^>]*\blang="en"[^>]*>([\s\S]*?)<\/p>/g);
    expect(wrapped?.some((paragraph) => paragraph.includes(opening))).toBe(
      true
    );
  });
});
