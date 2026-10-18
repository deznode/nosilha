import { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { enabledLocales } from "@/i18n/config";
import { getEntriesByCategory, getTownStatusSummary } from "@/lib/api";
import {
  archiveSitemapEntries,
  mdxSitemapEntries,
  staticSitemapEntries,
} from "@/lib/sitemap-entries";
import { pages } from "@/.velite";

/**
 * Generate sitemap for Nos Ilha Cultural Heritage Platform
 *
 * Includes static pages, every settlement and every place record at its archive
 * address (spec 034 FR-015) for Cape Verdean diaspora discovery through search engines.
 * Each page is listed once per enabled language (spec 041 FR-008); the entries
 * themselves are built in `lib/sitemap-entries.ts`.
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap();
}

/**
 * The whole sitemap, cached like the archive pages it lists. Under Cache Components
 * the timestamp would otherwise end the prerender before the entries were fetched.
 */
async function buildSitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("content");
  cacheTag("directory");
  cacheTag("towns");

  const locales = enabledLocales();
  const currentDate = new Date().toISOString();
  const staticPages = staticSitemapEntries(locales, currentDate);

  try {
    const [{ items: allEntries }, towns] = await Promise.all([
      getEntriesByCategory("all", 0, 100),
      getTownStatusSummary(),
    ]);

    return [
      ...staticPages,
      ...archiveSitemapEntries(locales, currentDate, towns, allEntries),
      ...mdxSitemapEntries(locales, pages),
    ];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return static pages if dynamic content fails
    return staticPages;
  }
}
