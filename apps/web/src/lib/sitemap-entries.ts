import type { MetadataRoute } from "next";

import {
  BCP47_TAGS,
  CONTENT_LANGUAGES,
  DEFAULT_LOCALE,
  type Locale,
} from "@/i18n/config";
import { localizedUrl } from "@/lib/metadata";
import { placeRecordPath } from "@/lib/place-path";
import type { DirectoryEntry } from "@/types/directory";
import type { TownStatusSummary } from "@/types/town";

type Entry = MetadataRoute.Sitemap[number];
type EntryFields = Pick<Entry, "lastModified" | "changeFrequency" | "priority">;

/** The MDX categories that have a route. `music` and `traditions` have none yet. */
const ROUTED_MDX_CATEGORIES: readonly string[] = ["history", "people"];

interface StaticPage extends Omit<EntryFields, "lastModified"> {
  path: string;
  /** False for a page whose body stays English under `/pt`. */
  hasPortuguese?: boolean;
}

const STATIC_PAGES: readonly StaticPage[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/map", changeFrequency: "weekly", priority: 0.9 },
  { path: "/settlements", changeFrequency: "weekly", priority: 0.9 },
  { path: "/photographs", changeFrequency: "weekly", priority: 0.8 },
  { path: "/films", changeFrequency: "weekly", priority: 0.8 },
  { path: "/stay", changeFrequency: "weekly", priority: 0.8 },
  { path: "/history", changeFrequency: "monthly", priority: 0.7 },
  { path: "/people", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contribute", changeFrequency: "monthly", priority: 0.5 },
  {
    path: "/privacy",
    changeFrequency: "yearly",
    priority: 0.3,
    hasPortuguese: false,
  },
  {
    path: "/terms",
    changeFrequency: "yearly",
    priority: 0.3,
    hasPortuguese: false,
  },
];

/** The home page is listed without a trailing slash, as it always has been. */
function sitemapUrl(path: string, locale: Locale): string {
  return localizedUrl(path, locale).replace(/\/$/, "");
}

/**
 * One entry per language the page exists in. A page in both languages declares
 * each address as an alternate of the other (spec 041 FR-008).
 */
function entriesFor(
  path: string,
  fields: EntryFields,
  locales: readonly Locale[]
): MetadataRoute.Sitemap {
  const languages =
    locales.length > 1
      ? {
          ...Object.fromEntries(
            locales.map((locale) => [
              locale === DEFAULT_LOCALE ? locale : BCP47_TAGS[locale],
              sitemapUrl(path, locale),
            ])
          ),
          "x-default": sitemapUrl(path, DEFAULT_LOCALE),
        }
      : undefined;

  return locales.map((locale) => ({
    url: sitemapUrl(path, locale),
    ...fields,
    ...(languages && { alternates: { languages } }),
  }));
}

export interface SitemapMdxPage {
  slug: string;
  category: string;
  language: string;
  publishDate: string;
  updatedDate?: string;
}

/** The pages listed even when the archive's own data cannot be fetched. */
export function staticSitemapEntries(
  locales: readonly Locale[],
  now: string
): MetadataRoute.Sitemap {
  return STATIC_PAGES.flatMap(({ path, hasPortuguese = true, ...fields }) =>
    entriesFor(
      path,
      { ...fields, lastModified: now },
      hasPortuguese ? locales : [DEFAULT_LOCALE]
    )
  );
}

/** Settlements and place records. Records are stored in English in every locale. */
export function archiveSitemapEntries(
  locales: readonly Locale[],
  now: string,
  towns: TownStatusSummary[],
  entries: DirectoryEntry[]
): MetadataRoute.Sitemap {
  const settlements = towns.flatMap((town) =>
    entriesFor(
      `/${town.slug}`,
      { lastModified: now, changeFrequency: "weekly", priority: 0.7 },
      locales
    )
  );

  // A record no settlement owns has no page, so it has no sitemap entry either.
  const records = entries.flatMap((entry) => {
    const path = placeRecordPath(entry, towns);
    if (!path) return [];

    return entriesFor(
      path,
      {
        lastModified: entry.updatedAt || now,
        changeFrequency: "weekly",
        priority: recordPriority(entry.category, entry.rating),
      },
      locales
    );
  });

  return [...settlements, ...records];
}

/**
 * Articles at `/{category}/{slug}`, once per article. An article is listed under
 * `/pt` only when it has a Portuguese file; without one, `/pt` shows the English
 * text and is not a second page worth indexing.
 */
export function mdxSitemapEntries(
  locales: readonly Locale[],
  pages: readonly SitemapMdxPage[]
): MetadataRoute.Sitemap {
  const articles = new Map<string, SitemapMdxPage[]>();
  for (const page of pages) {
    if (!ROUTED_MDX_CATEGORIES.includes(page.category)) continue;
    const path = `/${page.category}/${page.slug}`;
    articles.set(path, [...(articles.get(path) ?? []), page]);
  }

  return [...articles].flatMap(([path, versions]) => {
    const english = versions.find((page) => page.language === DEFAULT_LOCALE);
    if (!english) return [];

    const written = locales.filter((locale) =>
      versions.some((page) => page.language === CONTENT_LANGUAGES[locale])
    );

    return entriesFor(
      path,
      {
        lastModified: english.updatedDate || english.publishDate,
        changeFrequency: "monthly",
        priority: 0.8,
      },
      written
    );
  });
}

/** Priority of a place record, by category and rating. */
function recordPriority(category: string, rating?: number | null): number {
  let basePriority = 0.6;

  switch (category) {
    case "Restaurant":
    case "Hotel":
      basePriority = 0.7;
      break;
    case "Heritage":
    case "Nature":
      basePriority = 0.8;
      break;
  }

  // Boost priority for highly rated entries
  if (rating && rating >= 4.0) {
    basePriority = Math.min(basePriority + 0.1, 1.0);
  }

  return Math.round(basePriority * 10) / 10; // Round to 1 decimal place
}
