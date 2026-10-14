import { describe, expect, it } from "vitest";

import { LOCALES } from "@/i18n/config";
import { splitLocalePath, withLocale } from "@/i18n/paths";

/** Spec 041 FR-001, FR-002 — address building and prefix stripping. */
describe("splitLocalePath", () => {
  it.each([
    ["/pt", "pt", "/"],
    ["/pt/map", "pt", "/map"],
    ["/pt/photographs/abc", "pt", "/photographs/abc"],
    ["/", "en", "/"],
    ["/map", "en", "/map"],
    // A town whose name starts with `pt` is not the Portuguese prefix.
    ["/ptolemy", "en", "/ptolemy"],
  ])("%s → %s %s", (input, locale, pathname) => {
    expect(splitLocalePath(input, LOCALES)).toEqual({ locale, pathname });
  });

  it("reads /pt as an English address while Portuguese is off", () => {
    expect(splitLocalePath("/pt/map", ["en"])).toEqual({
      locale: "en",
      pathname: "/pt/map",
    });
  });
});

describe("withLocale", () => {
  it("leaves English addresses as they are", () => {
    expect(withLocale("/", "en")).toBe("/");
    expect(withLocale("/photographs/abc?place=nova-sintra", "en")).toBe(
      "/photographs/abc?place=nova-sintra"
    );
  });

  it("prefixes Portuguese addresses and keeps the query", () => {
    expect(withLocale("/", "pt")).toBe("/pt");
    expect(withLocale("/map?mode=records", "pt")).toBe("/pt/map?mode=records");
  });

  it("undoes splitLocalePath", () => {
    const { locale, pathname } = splitLocalePath("/pt/films/x", LOCALES);
    expect(withLocale(pathname, locale)).toBe("/pt/films/x");
  });
});
