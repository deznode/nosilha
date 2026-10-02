import { expect, test, type Page } from "@playwright/test";

/**
 * Spec 039 T-22 — the contribution flow, signed out, with no credentials.
 *
 * The sheet only opens: nothing here signs in or sends. Supabase is blocked
 * and recorded so a stray call fails the test instead of reaching the network.
 */

// A 1x1 PNG, enough for the photo input to accept.
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

const INSTAGRAM_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 300.0.0.20.110 (iPhone14,5; iOS 17_0; en_US; en-US; scale=3.00; 1170x2532; 500000000)";

/**
 * Blocks Supabase and returns the calls attempted. Matched on the auth API
 * path as well as the hosted domain, so a local or placeholder
 * NEXT_PUBLIC_SUPABASE_URL is still caught.
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

const TIMESTAMP = "2026-01-01T00:00:00Z";
const TOWNS = [
  ["town-ns", "nova-sintra", "Nova Sintra", 14.8667, -24.7],
  ["town-fa", "faja-dagua", "Fajã d'Água", 14.8578, -24.7267],
].map(([id, slug, name, latitude, longitude]) => ({
  id,
  slug,
  name,
  description: "",
  latitude,
  longitude,
  population: null,
  elevation: null,
  founded: null,
  highlights: [],
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
}));

/**
 * Answers the towns list and the first-photo lookup locally, so the picker
 * doesn't depend on a running, seeded backend (with the mock API, neither
 * request is made and these routes go unused).
 */
async function stubTowns(page: Page) {
  await page.route("**/api/v1/towns/all", (route) =>
    route.fulfill({ json: { data: TOWNS } })
  );
  await page.route("**/api/v1/gallery/towns/*/first-photo", (route) =>
    route.fulfill({ status: 204 })
  );
}

async function fillPhotoForm(page: Page) {
  await page.goto("/contribute/media");
  await expect(
    page.getByRole("heading", { name: "Give a photograph to the archive" })
  ).toBeVisible();

  await page.locator("#contribute-photo-file").setInputFiles({
    name: "brava.png",
    mimeType: "image/png",
    buffer: TINY_PNG,
  });
  await page.getByLabel("Who took this photograph?").fill("Maria Lopes");
  await page.getByLabel("Who is giving it to us?").fill("Ana Lopes");
  await page
    .getByRole("checkbox", { name: /I have the right to share this/ })
    .check();
}

async function pressSend(page: Page) {
  const send = page.getByRole("button", { name: "Send to the archive" });
  await expect(send).toBeVisible();
  await send.click();
}

test.describe("Contribute flow: entry", () => {
  test("nav Contribute opens the landing, then the photo form", async ({
    page,
  }) => {
    await page.goto("/about");
    await page
      .getByRole("banner")
      .getByRole("link", { name: "Contribute", exact: true })
      .click();
    await expect(page).toHaveURL(/\/contribute$/);

    await page.getByRole("link", { name: "Give a photograph →" }).click();
    await expect(page).toHaveURL(/\/contribute\/media$/);
    await expect(
      page.getByRole("heading", { name: "Give a photograph to the archive" })
    ).toBeVisible();
  });

  test("Send a film link opens the film form", async ({ page }) => {
    await page.goto("/contribute");
    await page.getByRole("link", { name: "Send a film link →" }).click();
    await expect(page).toHaveURL(/\/contribute\/media\?kind=film$/);
    await expect(
      page.getByRole("heading", { name: "Give a film to the archive" })
    ).toBeVisible();
  });
});

test.describe("Contribute flow: film link preview", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contribute/media?kind=film");
    await expect(
      page.getByRole("heading", { name: "Give a film to the archive" })
    ).toBeVisible();
  });

  test("a YouTube link shows its thumbnail and is recognised", async ({
    page,
  }) => {
    // The thumbnail comes from YouTube; answer it locally so the test is offline-safe.
    await page.route(/i\.ytimg\.com/, (route) =>
      route.fulfill({
        status: 200,
        contentType: "image/png",
        body: TINY_PNG,
      })
    );
    await page
      .getByLabel("Link to the film")
      .fill("https://youtu.be/dQw4w9WgXcQ");

    await expect(page.getByText("YouTube link recognised")).toBeVisible();
    const thumbnail = page.locator('img[src*="i.ytimg.com"]');
    await expect(thumbnail).toBeVisible();
    await expect(thumbnail).toHaveAttribute("src", /dQw4w9WgXcQ/);
  });

  test("a Vimeo link shows the ochre frame and requests no image", async ({
    page,
  }) => {
    const imageRequests: string[] = [];
    page.on("request", (req) => {
      if (/i\.ytimg\.com|vimeocdn|i\.vimeocdn/.test(req.url())) {
        imageRequests.push(req.url());
      }
    });
    await page
      .getByLabel("Link to the film")
      .fill("https://vimeo.com/218447301");

    await expect(
      page.getByText("Vimeo doesn't share a preview image")
    ).toBeVisible();
    await expect(page.getByText("Vimeo link recognised")).toBeVisible();
    await expect(
      page.locator('img[src*="ytimg"], img[src*="vimeo"]')
    ).toHaveCount(0);
    expect(imageRequests).toEqual([]);
  });

  test("a Facebook link is turned away", async ({ page }) => {
    await page
      .getByLabel("Link to the film")
      .fill("https://www.facebook.com/watch/?v=1234567890");

    await expect(
      page.getByText("This doesn't look like a YouTube or Vimeo link")
    ).toBeVisible();
    await expect(page.getByText(/link recognised/)).toHaveCount(0);
  });
});

test.describe("Contribute flow: town picker", () => {
  test("searches without accents and shows the chip after a pick", async ({
    page,
  }) => {
    await stubTowns(page);
    await page.goto("/contribute/media");
    await page.getByRole("button", { name: "Choose a town" }).click();

    const search = page.getByPlaceholder("Search Brava's towns");
    await expect(search).toBeVisible();
    await search.fill("faja");

    const result = page.getByRole("button", { name: /Fajã d.Água/ });
    await expect(result).toBeVisible();
    await expect(page.getByRole("button", { name: /Nova Sintra/ })).toHaveCount(
      0
    );
    await result.click();

    await expect(search).toBeHidden();
    const chip = page.getByRole("button", { name: "Change" }).locator("..");
    await expect(chip).toHaveText(/^Fajã d.ÁguaChange$/);
    await expect(
      page.getByText(/It will also appear on the Fajã d.Água page/)
    ).toBeVisible();
  });
});

test.describe("Contribute flow: send while signed out (phone)", () => {
  test.use({ viewport: { width: 360, height: 800 } });

  test("opens the S1 sheet", async ({ page }) => {
    const supabaseCalls = await blockSupabase(page);
    await fillPhotoForm(page);
    await pressSend(page);

    await expect(page.getByText("Confirm it's you").first()).toBeVisible();
    await expect(page.getByText("Held on this page · not sent")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue with Google" })
    ).toBeVisible();
    expect(supabaseCalls).toEqual([]);
  });
});

test.describe("Contribute flow: send while signed out (desktop)", () => {
  test.use({ viewport: { width: 1200, height: 900 } });

  test("opens the S1 dialog", async ({ page }) => {
    const supabaseCalls = await blockSupabase(page);
    await fillPhotoForm(page);
    await pressSend(page);

    // Headless UI's dialog root is a zero-size wrapper, so check it is attached
    // and that its content is visible inside it.
    const dialog = page.getByRole("dialog", { name: "Confirm it's you" });
    await expect(dialog).toBeAttached();
    await expect(
      dialog.getByText("Held on this page · not sent")
    ).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Continue with Google" })
    ).toBeVisible();
    expect(supabaseCalls).toEqual([]);
  });
});

test.describe("Contribute flow: send while signed out (in-app browser)", () => {
  test.use({ userAgent: INSTAGRAM_UA, viewport: { width: 360, height: 800 } });

  test("opens S11 instead of offering Google", async ({ page }) => {
    const supabaseCalls = await blockSupabase(page);
    await fillPhotoForm(page);
    await pressSend(page);

    await expect(
      page.getByText("Google isn't available in this browser")
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue with Google" })
    ).toHaveCount(0);
    expect(supabaseCalls).toEqual([]);
  });
});
