import { expect, test, type Page } from "@playwright/test";

import { escapeRegExp, settlements } from "../utils/archive-data";

/**
 * Spec 034 T-41 / FR-011 — a map address restores the view it names.
 *
 * `mode`, `status` and `sel` are the map's URL state (`theme` is not; see spec.md
 * FR-011). Opening such an address shows that mode, that filter and that selection,
 * with the legend counting what is on the map.
 */

function modeButton(page: Page, label: RegExp) {
  return page.getByRole("group", { name: "Map mode" }).getByRole("button", {
    name: label,
  });
}

function statusChip(page: Page, label: RegExp) {
  return page
    .getByRole("group", { name: "Filter by status" })
    .getByRole("button", { name: label });
}

test.describe("Map deep link", () => {
  test("restores mode, status and selection", async ({ page, request }) => {
    const towns = await settlements(request);
    // Furna is the prototype's example; any name-only settlement proves the same.
    const town =
      towns.find((t) => t.slug === "furna" && t.status === "NAME_ONLY") ??
      towns.find((t) => t.status === "NAME_ONLY");
    test.skip(!town, "no settlement is only a name");

    await page.goto(`/map?mode=settlements&status=name&sel=s:${town!.slug}`);

    await expect(modeButton(page, /^Settlements/)).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    await expect(statusChip(page, /^Name only/)).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    await expect(
      page.getByRole("region", { name: `Selected: ${town!.name}` })
    ).toBeVisible();

    const nameOnly = towns.filter((t) => t.status === "NAME_ONLY").length;
    await expect(statusChip(page, /^Name only/)).toContainText(
      String(nameOnly)
    );

    const legend = page.getByRole("list", { name: "Pin colour key" });
    await expect(legend).toBeVisible();
    await expect(legend.getByRole("listitem")).toHaveCount(3);
    await expect(legend).toContainText(`name only ${nameOnly}`);

    await expect(page).toHaveURL(/status=name/);
    await expect(page).toHaveURL(
      new RegExp(`sel=s(%3A|:)${escapeRegExp(town!.slug)}`)
    );
  });

  test("the address follows the view, and a reload restores it", async ({
    page,
  }) => {
    await page.goto("/map");
    await expect(modeButton(page, /^Settlements/)).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    await modeButton(page, /^Place records/).click();
    await expect(page).toHaveURL(/mode=records/);

    await statusChip(page, /^Documented/).click();
    await expect(page).toHaveURL(/status=documented/);

    await page.reload();
    await expect(modeButton(page, /^Place records/)).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    await expect(statusChip(page, /^Documented/)).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    await expect(
      page.getByRole("list", { name: "Pin colour key" })
    ).toBeVisible();
  });

  test("a theme parameter is not map state", async ({ page }) => {
    await page.goto("/map?theme=dark");
    await modeButton(page, /^Photographs/).click();

    await expect(page).toHaveURL(/mode=photographs/);
    await expect(page).not.toHaveURL(/theme=/);
  });
});
