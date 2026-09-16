import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { RESERVED_SLUGS, isReservedSlug } from "@/lib/reserved-slugs";

const APP_DIR = path.resolve(__dirname, "../../../src/app");

/** A route group contributes its children to its parent's URL, not a segment. */
function isRouteGroup(name: string): boolean {
  return name.startsWith("(") && name.endsWith(")");
}

function isDynamic(name: string): boolean {
  return name.startsWith("[");
}

/** Whether this directory tree renders anything at a URL. */
function servesRoutes(dir: string): boolean {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (servesRoutes(full)) return true;
    } else if (/^(page|route)\.(t|j)sx?$/.test(entry)) {
      return true;
    }
  }
  return false;
}

/** Every static first segment a URL can start with, read from `app/` itself. */
function staticTopLevelSegments(dir: string): string[] {
  const found: string[] = [];

  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (!statSync(full).isDirectory()) continue;

    if (isRouteGroup(entry)) {
      found.push(...staticTopLevelSegments(full));
    } else if (!isDynamic(entry) && servesRoutes(full)) {
      found.push(entry);
    }
  }

  return found;
}

/**
 * Spec 034 T-27 / FR-008, FR-015 — `/[town]` sits at the root of the archive group,
 * so any static segment anywhere in `app/` is a settlement name it must refuse.
 */
describe("RESERVED_SLUGS", () => {
  it("covers every static top-level segment the app actually serves", () => {
    const missing = staticTopLevelSegments(APP_DIR)
      .filter((segment) => !RESERVED_SLUGS.has(segment))
      .sort();

    expect(missing).toEqual([]);
  });

  it("is sorted and free of duplicates, so a reader can scan it", () => {
    const list = [...RESERVED_SLUGS];

    expect(list).toEqual([...new Set(list)]);
    expect(list).toEqual([...list].sort());
  });
});

describe("isReservedSlug", () => {
  it("refuses the archive's own screens", () => {
    for (const slug of ["settlements", "photographs", "stay", "map"]) {
      expect(isReservedSlug(slug)).toBe(true);
    }
  });

  it("refuses the secondary pages that keep the site header", () => {
    for (const slug of ["about", "contribute", "history", "privacy"]) {
      expect(isReservedSlug(slug)).toBe(true);
    }
  });

  it("allows a real settlement name", () => {
    expect(isReservedSlug("nova-sintra")).toBe(false);
    expect(isReservedSlug("faja-d-agua")).toBe(false);
  });

  it("refuses an empty or malformed slug rather than looking it up", () => {
    expect(isReservedSlug("")).toBe(true);
    expect(isReservedSlug("   ")).toBe(true);
  });

  it("is case-insensitive: /About is the about page, not a settlement", () => {
    expect(isReservedSlug("About")).toBe(true);
  });
});
