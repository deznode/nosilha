/**
 * Map explorer interactions. Spec 034 FR-011, FR-012 (rewritten in T-41).
 *
 * The map at `/map` sits under the archive bar and holds three modes, a status
 * filter, a search, a list, a legend, a selection card and a control stack. On a
 * narrow screen the list lives in a bottom sheet.
 *
 * MapLibre renders to a canvas, so pins are reached through their DOM markers and
 * the list rather than by pixel.
 */

import { expect, test, type Page } from "@playwright/test";

import { escapeRegExp, settlements } from "../utils/archive-data";

function sidebar(page: Page) {
  return page.getByRole("complementary", { name: "Filters and list" });
}

function modeButton(page: Page, label: RegExp) {
  return page.getByRole("group", { name: "Map mode" }).getByRole("button", {
    name: label,
  });
}

test.describe("Map explorer", () => {
  test("loads the map under the archive bar", async ({ page }) => {
    await page.goto("/map");

    await expect(
      page
        .getByRole("navigation", { name: "Archive", exact: true })
        .getByRole("link", {
          name: "Map",
        })
    ).toHaveAttribute("aria-current", "page");

    const map = page.locator(".maplibregl-map").first();
    await expect(map).toBeVisible();
    await expect(map.locator("canvas").first()).toBeVisible();

    // The page fills the viewport rather than scrolling past it.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("pins every settlement and counts each mode", async ({
    page,
    request,
  }) => {
    const towns = await settlements(request);
    await page.goto("/map");

    await expect(modeButton(page, /^Settlements/)).toContainText(
      String(towns.length)
    );
    await expect(page.locator(".maplibregl-marker")).toHaveCount(towns.length);
  });

  test("search narrows the list, and a row opens its selection card", async ({
    page,
    request,
  }) => {
    const [town] = await settlements(request);
    test.skip(!town, "the seed holds no settlement");

    await page.goto("/map");
    await page.getByRole("searchbox", { name: "Search Brava" }).fill(town.name);

    const row = sidebar(page).getByRole("button", {
      name: new RegExp(`^${escapeRegExp(town.name)}`),
    });
    await expect(row).toBeVisible();
    await row.click();

    const card = page.getByRole("region", { name: `Selected: ${town.name}` });
    await expect(card).toBeVisible();
    await expect(page).toHaveURL(
      new RegExp(`sel=s(%3A|:)${escapeRegExp(town.slug)}`)
    );

    await card.getByRole("button", { name: "Close" }).click();
    await expect(card).toBeHidden();
    await expect(page).not.toHaveURL(/sel=/);
  });

  test("a search that matches nothing says so", async ({ page }) => {
    await page.goto("/map");
    await page
      .getByRole("searchbox", { name: "Search Brava" })
      .fill("zzzz-not-a-place");

    await expect(sidebar(page)).toContainText(
      "Nothing on the map matches that."
    );
  });

  test("offers satellite, terrain and reset controls", async ({ page }) => {
    await page.goto("/map");

    const terrain = page.getByRole("button", { name: "3D terrain" });
    await expect(page.getByRole("button", { name: "Satellite" })).toBeVisible();
    await expect(terrain).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Reset view" })
    ).toBeVisible();

    await terrain.click();
    await expect(terrain).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "Reset view" }).click();
    await expect(terrain).toHaveAttribute("aria-pressed", "false");
  });
});

test.describe("Map explorer on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("keeps the list in a sheet that opens and closes", async ({ page }) => {
    await page.goto("/map");

    const sheet = page.getByTestId("map-sheet");
    await expect(sheet).toBeVisible();

    await page.getByRole("button", { name: "Filters and list" }).click();
    await expect(
      page.getByRole("button", { name: "Hide the list" })
    ).toBeVisible();
    await expect(
      page.getByRole("searchbox", { name: "Search Brava" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Hide the list" }).click();
    await expect(
      page.getByRole("button", { name: "Filters and list" })
    ).toBeVisible();
  });
});
