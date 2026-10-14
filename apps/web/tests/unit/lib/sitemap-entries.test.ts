import { describe, expect, it } from "vitest";

import { LOCALES } from "@/i18n/config";
import { siteConfig } from "@/lib/metadata";
import {
  archiveSitemapEntries,
  mdxSitemapEntries,
  staticSitemapEntries,
  type SitemapMdxPage,
} from "@/lib/sitemap-entries";
import type { DirectoryEntry } from "@/types/directory";
import type { TownStatusSummary } from "@/types/town";

const BASE = siteConfig.url;
const NOW = "2026-10-13T00:00:00.000Z";
const OFF = ["en"] as const;

const urls = (entries: { url: string }[]) => entries.map((entry) => entry.url);

const town = {
  id: "t1",
  slug: "nova-sintra",
  name: "Nova Sintra",
} as TownStatusSummary;
const record = {
  id: "e1",
  slug: "igreja",
  name: "Igreja",
  category: "Heritage",
  townId: "t1",
  town: "Nova Sintra",
  updatedAt: "2026-09-01T00:00:00.000Z",
} as unknown as DirectoryEntry;

const article = (
  category: string,
  slug: string,
  language: string
): SitemapMdxPage => ({
  category,
  slug,
  language,
  publishDate: "2026-01-01",
});

/** Spec 041 T-08 / FR-008, FR-009. */
describe("staticSitemapEntries", () => {
  it("lists the English pages as before while Portuguese is off", () => {
    const entries = staticSitemapEntries(OFF, NOW);

    expect(urls(entries)).toEqual([
      BASE,
      `${BASE}/about`,
      `${BASE}/map`,
      `${BASE}/settlements`,
      `${BASE}/photographs`,
      `${BASE}/films`,
      `${BASE}/stay`,
      `${BASE}/history`,
      `${BASE}/people`,
      `${BASE}/contact`,
      `${BASE}/contribute`,
      `${BASE}/privacy`,
      `${BASE}/terms`,
    ]);
    expect(entries.every((entry) => entry.alternates === undefined)).toBe(true);
    expect(entries[0]).toEqual({
      url: BASE,
      lastModified: NOW,
      changeFrequency: "weekly",
      priority: 1.0,
    });
  });

  it("no longer lists /music, which has no route", () => {
    expect(urls(staticSitemapEntries(LOCALES, NOW))).not.toContain(
      `${BASE}/music`
    );
  });

  it("lists both addresses, each naming the other, when Portuguese is on", () => {
    const entries = staticSitemapEntries(LOCALES, NOW);
    const languages = {
      en: `${BASE}/settlements`,
      "pt-PT": `${BASE}/pt/settlements`,
      "x-default": `${BASE}/settlements`,
    };

    for (const url of [`${BASE}/settlements`, `${BASE}/pt/settlements`]) {
      expect(entries.find((entry) => entry.url === url)?.alternates).toEqual({
        languages,
      });
    }
    expect(urls(entries)).toContain(`${BASE}/pt`);
  });

  it("lists the legal pages in English only", () => {
    const entries = staticSitemapEntries(LOCALES, NOW);

    for (const path of ["/privacy", "/terms"]) {
      expect(urls(entries)).toContain(`${BASE}${path}`);
      expect(urls(entries)).not.toContain(`${BASE}/pt${path}`);
      expect(
        entries.find((entry) => entry.url === `${BASE}${path}`)?.alternates
      ).toBeUndefined();
    }
  });
});

describe("archiveSitemapEntries", () => {
  it("lists settlements and place records once per enabled language", () => {
    expect(urls(archiveSitemapEntries(OFF, NOW, [town], [record]))).toEqual([
      `${BASE}/nova-sintra`,
      `${BASE}/nova-sintra/igreja`,
    ]);
    expect(urls(archiveSitemapEntries(LOCALES, NOW, [town], [record]))).toEqual(
      [
        `${BASE}/nova-sintra`,
        `${BASE}/pt/nova-sintra`,
        `${BASE}/nova-sintra/igreja`,
        `${BASE}/pt/nova-sintra/igreja`,
      ]
    );
  });

  it("keeps a record's own date and priority", () => {
    const [, entry] = archiveSitemapEntries(OFF, NOW, [town], [record]);

    expect(entry).toMatchObject({
      lastModified: record.updatedAt,
      priority: 0.8,
    });
  });
});

describe("mdxSitemapEntries", () => {
  const pages = [
    article("people", "daddy-grace", "en"),
    article("people", "eugenio-tavares", "en"),
    article("people", "eugenio-tavares", "pt"),
    article("music", "morna", "en"),
    article("traditions", "festas", "en"),
  ];

  it("uses /{category}/{slug} and never a ?lang= address", () => {
    const entries = mdxSitemapEntries(OFF, pages);

    expect(urls(entries)).toEqual([
      `${BASE}/people/daddy-grace`,
      `${BASE}/people/eugenio-tavares`,
    ]);
    expect(urls(entries).some((url) => url.includes("?lang="))).toBe(false);
  });

  it("leaves out categories that have no route", () => {
    const listed = urls(mdxSitemapEntries(LOCALES, pages)).join(" ");

    expect(listed).not.toContain("/music/");
    expect(listed).not.toContain("/traditions/");
  });

  it("lists a Portuguese address only for an article with a Portuguese file", () => {
    const entries = mdxSitemapEntries(LOCALES, pages);

    expect(urls(entries)).toEqual([
      `${BASE}/people/daddy-grace`,
      `${BASE}/people/eugenio-tavares`,
      `${BASE}/pt/people/eugenio-tavares`,
    ]);
    expect(entries[0].alternates).toBeUndefined();
    expect(entries[1].alternates?.languages).toHaveProperty("pt-PT");
  });

  it("ignores a Portuguese file while Portuguese is off", () => {
    expect(urls(mdxSitemapEntries(OFF, pages))).not.toContain(
      `${BASE}/pt/people/eugenio-tavares`
    );
  });
});
