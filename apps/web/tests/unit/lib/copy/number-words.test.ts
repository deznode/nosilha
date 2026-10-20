import { describe, it, expect } from "vitest";
import {
  openingWords,
  capitalise,
  joinList,
  toWords,
} from "@/lib/copy/number-words";

describe("toWords", () => {
  it.each([
    [1, "one"],
    [5, "five"],
    [12, "twelve"],
    [20, "twenty"],
    [22, "twenty-two"],
    [25, "twenty-five"],
    [99, "ninety-nine"],
  ])("writes %i as %s", (n, words) => {
    expect(toWords(n)).toBe(words);
  });

  it("writes zero as a number word, leaving zero phrasing to the caller", () => {
    expect(toWords(0)).toBe("zero");
    expect(toWords(0)).not.toBe("none");
  });

  it.each([100, 250, 1024])("falls back to digits for %i", (n) => {
    expect(toWords(n)).toBe(String(n));
  });

  it.each([-1, 2.5, Number.NaN])("falls back to digits for %s", (n) => {
    expect(toWords(n)).toBe(String(n));
  });
});

describe("capitalise", () => {
  it("upper-cases the first letter only", () => {
    expect(capitalise("twenty-five settlements")).toBe(
      "Twenty-five settlements"
    );
  });

  it("returns an empty string unchanged", () => {
    expect(capitalise("")).toBe("");
  });
});

describe("joinList", () => {
  it("keeps the English join, with no comma before the last word", () => {
    expect(joinList(["a", "b", "c"], "and")).toBe("a, b and c");
    expect(joinList(["a", "b"], "or")).toBe("a or b");
  });

  it("joins Portuguese lists with e and ou", () => {
    expect(joinList(["a", "b", "c"], "and", "pt-PT")).toBe("a, b e c");
    expect(joinList(["a", "b"], "or", "pt-PT")).toBe("a ou b");
  });

  it("returns a single item or nothing unchanged", () => {
    expect(joinList(["a"], "and", "pt-PT")).toBe("a");
    expect(joinList([], "and")).toBe("");
  });
});

describe("toWords in Portuguese", () => {
  it.each([
    [1, "masculine", "um"],
    [1, "feminine", "uma"],
    [2, "masculine", "dois"],
    [2, "feminine", "duas"],
    [14, "masculine", "catorze"],
    [16, "masculine", "dezasseis"],
    [20, "feminine", "vinte"],
    [21, "masculine", "vinte e um"],
    [21, "feminine", "vinte e uma"],
    [32, "feminine", "trinta e duas"],
    [99, "masculine", "noventa e nove"],
  ] as const)("writes %i (%s) as %s", (n, gender, words) => {
    expect(toWords(n, { locale: "pt-PT", gender })).toBe(words);
  });

  it("falls back to digits outside 0 to 99", () => {
    expect(toWords(100, { locale: "pt-PT" })).toBe("100");
  });
});

describe("capitalise in Portuguese", () => {
  it("upper-cases an accented first letter", () => {
    expect(capitalise("três registos", "pt-PT")).toBe("Três registos");
  });
});

describe("openingWords", () => {
  it("capitalises the count to open a sentence", () => {
    expect(openingWords(25, "en")).toBe("Twenty-five");
  });

  it("agrees with a feminine noun in Portuguese", () => {
    expect(openingWords(21, "pt-PT", "feminine")).toBe("Vinte e uma");
  });
});
