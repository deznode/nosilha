import type { Metadata } from "next";
import { describe, expect, it } from "vitest";

import {
  generatePageMetadata,
  localeAlternates,
  siteConfig,
  withLocaleMetadata,
} from "@/lib/metadata";

const BASE = siteConfig.url;

const page = {
  title: "Settlements",
  description: "Every settlement on Brava.",
  path: "/settlements",
} as const;

const openGraph = (metadata: Metadata) =>
  metadata.openGraph as { locale?: string; url?: string };

/** Spec 041 T-07 / FR-008 — canonical, alternates and `og:locale` per language. */
describe("generatePageMetadata", () => {
  describe("while Portuguese is off", () => {
    it("writes the English tags exactly as before the locale segment", () => {
      const metadata = generatePageMetadata({ ...page, locale: "en" });

      expect(metadata.alternates).toEqual({
        canonical: `${BASE}/settlements`,
      });
      expect(openGraph(metadata).locale).toBe("en_US");
      expect(openGraph(metadata).url).toBe(`${BASE}/settlements`);
    });

    it("keeps the home page canonical with its trailing slash", () => {
      const metadata = generatePageMetadata({
        ...page,
        path: "/",
        locale: "en",
      });

      expect(metadata.alternates).toEqual({ canonical: `${BASE}/` });
    });

    it("declares no language alternates", () => {
      const metadata = generatePageMetadata({ ...page, locale: "en" });

      expect(metadata.alternates?.languages).toBeUndefined();
    });
  });

  describe("with Portuguese on", () => {
    const on = { portugueseEnabled: true } as const;

    it("makes each language canonical at its own address", () => {
      const english = generatePageMetadata({ ...page, ...on, locale: "en" });
      const portuguese = generatePageMetadata({ ...page, ...on, locale: "pt" });

      expect(english.alternates?.canonical).toBe(`${BASE}/settlements`);
      expect(portuguese.alternates?.canonical).toBe(`${BASE}/pt/settlements`);
      expect(openGraph(portuguese).url).toBe(`${BASE}/pt/settlements`);
    });

    it("sends og:locale pt_PT on a Portuguese page", () => {
      const metadata = generatePageMetadata({ ...page, ...on, locale: "pt" });

      expect(openGraph(metadata).locale).toBe("pt_PT");
    });

    it("declares en, pt-PT and x-default, the same from either language", () => {
      const languages = {
        en: `${BASE}/settlements`,
        "pt-PT": `${BASE}/pt/settlements`,
        "x-default": `${BASE}/settlements`,
      };

      for (const locale of ["en", "pt"] as const) {
        const metadata = generatePageMetadata({ ...page, ...on, locale });
        expect(metadata.alternates?.languages).toEqual(languages);
      }
    });

    it("points the Portuguese home page at /pt", () => {
      const metadata = generatePageMetadata({
        ...page,
        ...on,
        path: "/",
        locale: "pt",
      });

      expect(metadata.alternates?.canonical).toBe(`${BASE}/pt`);
    });

    it("leaves a page with no Portuguese version out of the alternates", () => {
      const metadata = generatePageMetadata({
        ...page,
        ...on,
        locale: "pt",
        hasPortuguese: false,
      });

      expect(metadata.alternates).toEqual({
        canonical: `${BASE}/pt/settlements`,
      });
    });
  });
});

describe("localeAlternates", () => {
  it("defaults to the build's setting, which is off in tests", () => {
    expect(localeAlternates({ path: "/about", locale: "en" })).toEqual({
      canonical: `${BASE}/about`,
    });
  });
});

/** The pages that write their metadata by hand: about, contact, legal, editorial. */
describe("withLocaleMetadata", () => {
  const handBuilt: Metadata = {
    title: "About Nos Ilha",
    description: "About the archive.",
    openGraph: { title: "About", images: ["/images/about.jpg"] },
    robots: { index: true, follow: true },
  };

  it("adds only a canonical to an English page", () => {
    const metadata = withLocaleMetadata(handBuilt, {
      path: "/about",
      locale: "en",
    });

    expect(metadata).toEqual({
      ...handBuilt,
      alternates: { canonical: `${BASE}/about` },
    });
  });

  it("adds og:locale and the Portuguese canonical under /pt", () => {
    const metadata = withLocaleMetadata(handBuilt, {
      path: "/about",
      locale: "pt",
      portugueseEnabled: true,
    });

    expect(metadata.alternates?.canonical).toBe(`${BASE}/pt/about`);
    expect(openGraph(metadata)).toEqual({
      ...handBuilt.openGraph,
      locale: "pt_PT",
    });
    expect(Object.keys(metadata.alternates?.languages ?? {})).toEqual([
      "en",
      "pt-PT",
      "x-default",
    ]);
  });

  it("keeps a legal page out of the alternates", () => {
    const metadata = withLocaleMetadata(handBuilt, {
      path: "/privacy",
      locale: "pt",
      hasPortuguese: false,
      portugueseEnabled: true,
    });

    expect(metadata.alternates).toEqual({ canonical: `${BASE}/pt/privacy` });
  });

  it("leaves openGraph alone when the page did not write one", () => {
    const metadata = withLocaleMetadata(
      { title: "Add Directory Entry" },
      { path: "/contribute/directory", locale: "pt", portugueseEnabled: true }
    );

    // An `openGraph` key, even undefined, would drop the layout's inherited block.
    expect("openGraph" in metadata).toBe(false);
  });
});
