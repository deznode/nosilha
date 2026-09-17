import { expect, test } from "@playwright/test";

import { escapeRegExp, settlements } from "../utils/archive-data";

/**
 * Spec 034 T-41 / FR-007 — the settlements index on a sparse archive.
 *
 * Most settlements are only a name. "Nothing yet" lists exactly those, and a
 * name-only card cannot open a settlement page with nothing on it, so it opens the
 * map with that settlement's pin selected.
 */
test.describe("Settlements index", () => {
  test("filters to the settlements that are only a name", async ({
    page,
    request,
  }) => {
    const towns = await settlements(request);
    const nameOnly = towns.filter((town) => town.entryCount === 0);
    test.skip(nameOnly.length === 0, "every settlement holds a record");

    await page.goto("/settlements");
    await expect(
      page.getByRole("heading", { level: 1, name: "Settlements" })
    ).toBeVisible();

    const chip = page.getByRole("button", { name: /Nothing yet/ });
    await expect(chip).toContainText(String(nameOnly.length));
    await chip.click();

    await expect(page).toHaveURL(/\/settlements\?filter=none$/);
    const cards = page.locator('main a[href^="/map?"]');
    await expect(cards).toHaveCount(nameOnly.length);

    // The filter is a link someone can send: a reload keeps it.
    await page.reload();
    await expect(cards).toHaveCount(nameOnly.length);
  });

  test("a name-only card opens the map with its settlement selected", async ({
    page,
    request,
  }) => {
    const towns = await settlements(request);
    const town = towns.find((candidate) => candidate.entryCount === 0);
    test.skip(!town, "every settlement holds a record");

    await page.goto("/settlements?filter=none");
    await page
      .getByRole("link", {
        name: new RegExp(`^${escapeRegExp(town!.name)}(\\s|$)`),
      })
      .click();

    // The map may normalise the address once it applies the selection; the
    // selection itself must survive.
    await expect(page).toHaveURL(
      new RegExp(`/map\\?.*sel=s(%3A|:)${escapeRegExp(town!.slug)}`)
    );
    await expect(
      page.getByRole("region", { name: `Selected: ${town!.name}` })
    ).toBeVisible();
    await expect(
      page
        .getByRole("group", { name: "Map mode" })
        .getByRole("button", { name: /Settlements/ })
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("a card with records opens the settlement page", async ({
    page,
    request,
  }) => {
    const towns = await settlements(request);
    const town = towns.find((candidate) => candidate.entryCount > 0);
    test.skip(!town, "no settlement holds a record");

    await page.goto("/settlements?filter=has");
    await page
      .getByRole("link", {
        name: new RegExp(`^${escapeRegExp(town!.name)}(\\s|$)`),
      })
      .click();

    await expect(page).toHaveURL(new RegExp(`/${escapeRegExp(town!.slug)}$`));
    await expect(
      page.getByRole("heading", { level: 1, name: town!.name })
    ).toBeVisible();
  });
});
