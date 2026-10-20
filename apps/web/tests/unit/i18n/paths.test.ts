import { describe, expect, it, vi } from "vitest";

import { LOCALES } from "@/i18n/config";
import { getPathname } from "@/i18n/navigation";
import { splitLocalePath } from "@/i18n/paths";

// The real next-intl builder with this app's routing, not the setup's stand-in.
// `next/navigation` is unmocked too, because next-intl wraps its `redirect` on load.
vi.unmock("@/i18n/navigation");
vi.unmock("next/navigation");

/** Spec 041 FR-001, FR-002 — address building and prefix stripping. */
describe("splitLocalePath", () => {
  it.each([
    ["/pt", "pt-PT", "/"],
    ["/pt/map", "pt-PT", "/map"],
    ["/pt/photographs/abc", "pt-PT", "/photographs/abc"],
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

describe("getPathname", () => {
  it("leaves English addresses as they are", () => {
    expect(getPathname({ href: "/", locale: "en" })).toBe("/");
    expect(
      getPathname({ href: "/photographs/abc?place=nova-sintra", locale: "en" })
    ).toBe("/photographs/abc?place=nova-sintra");
  });

  it("prefixes Portuguese addresses and keeps the query", () => {
    expect(getPathname({ href: "/", locale: "pt-PT" })).toBe("/pt");
    expect(getPathname({ href: "/map?mode=records", locale: "pt-PT" })).toBe(
      "/pt/map?mode=records"
    );
    // The setup's stand-in would give `/pt/?ask=1`: this fails if it is in use.
    expect(getPathname({ href: "/?ask=1", locale: "pt-PT" })).toBe("/pt?ask=1");
  });

  it("undoes splitLocalePath", () => {
    const { locale, pathname } = splitLocalePath("/pt/films/x", LOCALES);
    expect(getPathname({ href: pathname, locale })).toBe("/pt/films/x");
  });
});
