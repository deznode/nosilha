import { describe, expect, it } from "vitest";

import { excerpt, trimmed } from "@/lib/text";

describe("trimmed", () => {
  it("treats blank and absent alike", () => {
    expect(trimmed("  Nova Sintra ")).toBe("Nova Sintra");
    expect(trimmed("   ")).toBeNull();
    expect(trimmed(undefined)).toBeNull();
  });
});

describe("excerpt", () => {
  it("keeps a short text whole, on one line", () => {
    expect(excerpt("A walk\nthrough  the town.")).toBe(
      "A walk through the town."
    );
  });

  it("cuts a long text at a word, within the limit", () => {
    const text = `${"Brava ".repeat(60)}end`;
    const cut = excerpt(text, 40);
    expect(cut.length).toBeLessThanOrEqual(40);
    expect(cut.endsWith("…")).toBe(true);
    expect(cut).not.toMatch(/\s…$/);
    expect(text.startsWith(cut.slice(0, -1))).toBe(true);
  });
});
