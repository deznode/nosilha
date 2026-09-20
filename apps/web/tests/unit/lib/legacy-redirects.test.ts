import { describe, expect, it } from "vitest";

import { LEGACY_REDIRECTS } from "@/lib/legacy-redirects";

/** The destination a rule sends this exact path to, or undefined when none matches. */
function destinationOf(pathname: string): string | undefined {
  for (const rule of LEGACY_REDIRECTS) {
    const names: string[] = [];
    const pattern = rule.source.replace(/:([a-z]+)/gi, (_, name: string) => {
      names.push(name);
      return "([^/]+)";
    });
    const match = new RegExp(`^${pattern}$`).exec(pathname);
    if (!match) continue;

    return names.reduce(
      (destination, name, index) =>
        destination.replace(`:${name}`, match[index + 1]),
      rule.destination
    );
  }
  return undefined;
}

/**
 * Spec 034 FR-015 — the old gallery and directory addresses keep working.
 * `next.config.ts` spreads this table into `redirects()`, and Next.js applies the
 * first rule that matches, so the order below is part of the contract.
 */
describe("LEGACY_REDIRECTS", () => {
  it("is permanent throughout, so search engines move the ranking (308)", () => {
    expect(LEGACY_REDIRECTS.length).toBeGreaterThan(0);
    for (const rule of LEGACY_REDIRECTS) {
      expect(rule.permanent).toBe(true);
    }
  });

  it("sends the gallery to the photographs", () => {
    expect(destinationOf("/gallery")).toBe("/photographs");
    expect(destinationOf("/gallery/photo/abc-123")).toBe(
      "/photographs/abc-123"
    );
  });

  it("sends the hotel listing to Stay, under either spelling", () => {
    expect(destinationOf("/directory/hotel")).toBe("/stay");
    expect(destinationOf("/directory/hotels")).toBe("/stay");
  });

  it("sends the directory and every other listing to the settlements", () => {
    expect(destinationOf("/directory")).toBe("/settlements");
    for (const listing of [
      "all",
      "heritage",
      "landmark",
      "restaurants",
      "towns",
    ]) {
      expect(destinationOf(`/directory/${listing}`)).toBe("/settlements");
    }
  });

  it("leaves an entry address to the handler that can look the record up", () => {
    expect(destinationOf("/directory/heritage/igreja")).toBeUndefined();
    expect(destinationOf("/directory/entry/igreja")).toBeUndefined();
  });

  it("never touches the new addresses", () => {
    for (const path of [
      "/photographs",
      "/settlements",
      "/stay",
      "/nova-sintra",
    ]) {
      expect(destinationOf(path)).toBeUndefined();
    }
  });
});
