import { describe, expect, it } from "vitest";

import {
  BCP47_TAGS,
  DEFAULT_LOCALE,
  HTML_LANG,
  OG_LOCALES,
  enabledLocales,
  isEnabledLocale,
} from "@/i18n/config";

/** Spec 041 T-01 / FR-009 — one setting decides whether Portuguese has addresses. */
describe("enabledLocales", () => {
  it("is English only while Portuguese is off", () => {
    expect(enabledLocales(false)).toEqual(["en"]);
  });

  it("adds Portuguese when it is on", () => {
    expect(enabledLocales(true)).toEqual(["en", "pt"]);
  });

  it("defaults to off: nothing sets NEXT_PUBLIC_ENABLE_PT in tests", () => {
    expect(enabledLocales()).toEqual([DEFAULT_LOCALE]);
  });
});

describe("isEnabledLocale", () => {
  it("refuses Portuguese while it is off", () => {
    expect(isEnabledLocale("pt", false)).toBe(false);
    expect(isEnabledLocale("en", false)).toBe(true);
  });

  it("accepts Portuguese when it is on", () => {
    expect(isEnabledLocale("pt", true)).toBe(true);
  });

  it("refuses anything that is not a routed locale", () => {
    for (const value of ["kea", "fr", "PT", "", undefined, null, 1]) {
      expect(isEnabledLocale(value, true)).toBe(false);
    }
  });
});

describe("locale tags", () => {
  it("maps each locale to its BCP 47 tag", () => {
    expect(BCP47_TAGS).toEqual({ en: "en-US", pt: "pt-PT" });
  });

  it("keeps <html lang> as `en` for English", () => {
    expect(HTML_LANG).toEqual({ en: "en", pt: "pt-PT" });
  });

  it("spells Open Graph locales with an underscore", () => {
    expect(OG_LOCALES).toEqual({ en: "en_US", pt: "pt_PT" });
  });
});
