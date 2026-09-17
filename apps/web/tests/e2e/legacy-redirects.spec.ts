import { expect, test, type APIRequestContext } from "@playwright/test";

import { addressedRecord } from "../utils/archive-data";

/**
 * Spec 034 T-38 / FR-015 — the pre-archive addresses keep working.
 *
 * Replaces `directory-browsing.spec.ts`: the directory and the gallery are retired,
 * and what is left to test about them is where their old addresses now lead.
 */

async function redirectOf(request: APIRequestContext, path: string) {
  const response = await request.get(path, { maxRedirects: 0 });
  const location = response.headers()["location"] ?? "";
  return {
    status: response.status(),
    location: new URL(location, "http://placeholder").pathname,
  };
}

test.describe("Legacy addresses", () => {
  for (const [from, to] of [
    ["/gallery", "/photographs"],
    [
      "/gallery/photo/0b6f7c1e-2c1a-4f59-9a55-5d1d2b1e0a11",
      "/photographs/0b6f7c1e-2c1a-4f59-9a55-5d1d2b1e0a11",
    ],
    ["/directory", "/settlements"],
    ["/directory/all", "/settlements"],
    ["/directory/heritage", "/settlements"],
    ["/directory/hotel", "/stay"],
    ["/directory/hotels", "/stay"],
  ] as const) {
    test(`${from} moves permanently to ${to}`, async ({ request }) => {
      expect(await redirectOf(request, from)).toEqual({
        status: 308,
        location: to,
      });
    });
  }

  test("an old record address moves to the record's page", async ({
    request,
    page,
  }) => {
    const { record, path } = await addressedRecord(request);

    for (const legacy of [
      `/directory/${record.category.toLowerCase()}/${record.slug}`,
      `/directory/entry/${record.slug}`,
    ]) {
      expect(await redirectOf(request, legacy)).toEqual({
        status: 308,
        location: path,
      });
    }

    await page.goto(
      `/directory/${record.category.toLowerCase()}/${record.slug}`
    );
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(
      page.getByRole("heading", { level: 1, name: record.name })
    ).toBeVisible();
  });

  test("an unknown record address goes to the settlements, temporarily", async ({
    request,
  }) => {
    expect(
      await redirectOf(request, "/directory/heritage/not-a-real-record")
    ).toEqual({ status: 307, location: "/settlements" });
  });

  test("the retired pages are gone from the navigation", async ({ page }) => {
    await page.goto("/about");
    const links = page.locator('a[href^="/directory"], a[href^="/gallery"]');
    await expect(links).toHaveCount(0);
  });
});
