import { getTranslations } from "next-intl/server";
import { describe, expect, it } from "vitest";

import { categoryLabel } from "@/lib/category-label";

/** Spec 034 FR-014, spec 041 FR-004. */
describe("categoryLabel", () => {
  it("calls the Hotel category Stay", () => {
    expect(categoryLabel("Hotel")).toBe("Stay");
  });

  it("prints any other category as the data carries it", () => {
    expect(categoryLabel("Beach")).toBe("Beach");
    expect(categoryLabel("Unmapped")).toBe("Unmapped");
  });

  it("reads the same English from the `categories` namespace", async () => {
    const t = await getTranslations("categories");

    for (const category of [
      "Restaurant",
      "Hotel",
      "Beach",
      "Heritage",
      "Nature",
      "Viewpoint",
      "Trail",
      "Church",
      "Port",
      "Unmapped",
    ]) {
      expect(categoryLabel(category, t), category).toBe(
        categoryLabel(category)
      );
    }
  });
});
