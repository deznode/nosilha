import { expect, test } from "@playwright/test";

import { settlements } from "../utils/archive-data";

/**
 * Archive home. Spec 034 FR-003, FR-006 (rewritten in T-41 for the new chrome).
 *
 * The home page sits under the archive bar: a wordmark, a theme pill and five nav
 * pills. Below the hero, four route cards lead into the archive, each carrying a
 * count read from live data.
 */

const PILLS = [
  ["Home", "/"],
  ["Settlements", "/settlements"],
  ["Photographs", "/photographs"],
  ["Map", "/map"],
  ["Stay", "/stay"],
] as const;

test.describe("Archive home", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("opens on the archive's own headline", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "An archive of Brava, built from what people send us",
      })
    ).toBeVisible();

    const description = await page.getAttribute(
      'meta[name="description"]',
      "content"
    );
    expect(description).toContain("Brava");
  });

  test("the archive bar reaches every archive screen", async ({ page }) => {
    const bar = page.getByRole("navigation", { name: "Archive", exact: true });

    await expect(bar.getByRole("link", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page"
    );

    for (const [label, href] of PILLS) {
      await expect(bar.getByRole("link", { name: label })).toHaveAttribute(
        "href",
        href
      );
    }

    await bar.getByRole("link", { name: "Settlements" }).click();
    await expect(page).toHaveURL(/\/settlements$/);
    await expect(
      bar.getByRole("link", { name: "Settlements" })
    ).toHaveAttribute("aria-current", "page");
  });

  test("the theme pill switches between paper and dark", async ({ page }) => {
    const pill = page.getByRole("button", { name: "Dark" });
    await expect(pill).toHaveAttribute("title", "Switch to the dark theme");

    await pill.click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    const back = page.getByRole("button", { name: "Light" });
    await expect(back).toHaveAttribute("title", "Switch to the light theme");
    await back.click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });

  test("the route cards lead into the archive with live counts", async ({
    page,
    request,
  }) => {
    const towns = await settlements(request);
    const cards = page.getByRole("navigation", { name: "The archive" });

    for (const [, href] of PILLS.slice(1)) {
      await expect(cards.locator(`a[href="${href}"]`)).toHaveCount(1);
    }
    // Counts are written as words ("Twenty-five names"), so the card is checked for
    // the sentence it must carry rather than for a numeral.
    await expect(cards.locator('a[href="/settlements"]')).toContainText(
      towns.length === 1 ? /\bname\./ : /\bnames\./
    );
  });

  test("links nowhere retired", async ({ page }) => {
    await expect(
      page.locator('a[href^="/directory"], a[href^="/gallery"]')
    ).toHaveCount(0);
  });
});
