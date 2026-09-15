import { describe, it, expect } from "vitest";
import { capitalise, countSentence, toWords } from "@/lib/copy/number-words";

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
