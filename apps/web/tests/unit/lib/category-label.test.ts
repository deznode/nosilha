import { getTranslations } from "next-intl/server";
import { beforeAll, describe, expect, it } from "vitest";

import { categoryLabel, type CategoryTranslator } from "@/lib/category-label";

/** Spec 034 FR-014, spec 041 FR-004. */
describe("categoryLabel", () => {
  let t: CategoryTranslator;
  beforeAll(async () => {
    t = await getTranslations("categories");
  });

  it("calls the Hotel category Stay", () => {
    expect(categoryLabel("Hotel", t)).toBe("Stay");
  });

  it("prints any other category as the data carries it", () => {
    expect(categoryLabel("Beach", t)).toBe("Beach");
    expect(categoryLabel("Unmapped", t)).toBe("Unmapped");
  });
});
