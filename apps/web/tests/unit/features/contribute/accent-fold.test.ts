import { describe, it, expect } from "vitest";
import { foldAccents } from "@/features/contribute/lib/accent-fold";

describe("foldAccents", () => {
  it("lower-cases and strips diacritics", () => {
    expect(foldAccents("Fajã d'Água")).toBe("faja d'agua");
  });

  it("matches a plain-ASCII search term against an accented town name", () => {
    expect(foldAccents("Fajã d'Água")).toContain(foldAccents("faja"));
  });

  it("leaves already-plain text unchanged aside from casing", () => {
    expect(foldAccents("Nossa Senhora do Monte")).toBe(
      "nossa senhora do monte"
    );
  });

  it("handles an empty string", () => {
    expect(foldAccents("")).toBe("");
  });
});
