import { describe, it, expect } from "vitest";
import {
  capitalise,
  countSentence,
  joinList,
  plural,
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

describe("countSentence", () => {
  const settlements = {
    one: "{n} settlement",
    many: "{n} settlements",
    zero: "No settlements",
  };

  it("reproduces the prototype's settlement count", () => {
    expect(countSentence(25, settlements)).toBe("Twenty-five settlements");
  });

  it("reproduces the prototype's place record count", () => {
    expect(
      countSentence(5, {
        one: "{n} place record",
        many: "{n} place records",
        zero: "No place records",
      })
    ).toBe("Five place records");
  });

  it("uses the singular form for one", () => {
    expect(countSentence(1, settlements)).toBe("One settlement");
  });

  it("uses the caller's zero phrasing instead of a number", () => {
    expect(
      countSentence(0, {
        one: "{n} carries a photographer",
        many: "{n} carry a photographer",
        zero: "None carries a photographer",
      })
    ).toBe("None carries a photographer");
  });

  it("keeps digits for counts of a hundred or more", () => {
    expect(countSentence(140, settlements)).toBe("140 settlements");
  });
});

describe("joinList", () => {
  it("keeps the English join, with no comma before the last word", () => {
    expect(joinList(["a", "b", "c"], "and")).toBe("a, b and c");
    expect(joinList(["a", "b"], "or")).toBe("a or b");
  });

  it("joins Portuguese lists with e and ou", () => {
    expect(joinList(["a", "b", "c"], "and", "pt")).toBe("a, b e c");
    expect(joinList(["a", "b"], "or", "pt")).toBe("a ou b");
  });

  it("returns a single item or nothing unchanged", () => {
    expect(joinList(["a"], "and", "pt")).toBe("a");
    expect(joinList([], "and")).toBe("");
  });
});

describe("plural", () => {
  it.each([
    [0, "many"],
    [1, "one"],
    [2, "many"],
  ])("picks the English form for %i", (n, form) => {
    expect(plural(n, "one", "many")).toBe(form);
  });

  it("treats zero as plural in European Portuguese", () => {
    expect(plural(0, "registo", "registos", "pt")).toBe("registos");
    expect(plural(1, "registo", "registos", "pt")).toBe("registo");
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
    expect(toWords(n, { locale: "pt", gender })).toBe(words);
  });

  it("falls back to digits outside 0 to 99", () => {
    expect(toWords(100, { locale: "pt" })).toBe("100");
  });
});

describe("countSentence in Portuguese", () => {
  const photographs = {
    one: "{n} fotografia",
    many: "{n} fotografias",
    zero: "Nenhuma fotografia",
  };

  it("agrees the number with a feminine noun", () => {
    expect(
      countSentence(1, photographs, { locale: "pt", gender: "feminine" })
    ).toBe("Uma fotografia");
    expect(
      countSentence(21, photographs, { locale: "pt", gender: "feminine" })
    ).toBe("Vinte e uma fotografias");
  });

  it("returns the zero sentence as written", () => {
    expect(countSentence(0, photographs, { locale: "pt" })).toBe(
      "Nenhuma fotografia"
    );
  });
});

describe("capitalise in Portuguese", () => {
  it("upper-cases an accented first letter", () => {
    expect(capitalise("três registos", "pt")).toBe("Três registos");
  });
});
