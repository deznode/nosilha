import { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { getEntriesByCategory, getTownStatusSummary } from "@/lib/api";
import { siteConfig } from "@/lib/metadata";
import { placeRecordPath } from "@/lib/place-path";
import { pages } from "@/.velite";

/**
 * Generate sitemap for Nos Ilha Cultural Heritage Platform
 *
 * Includes static pages, every settlement and every place record at its archive
 * address (spec 034 FR-015) for Cape Verdean diaspora discovery through search engines.
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

  const baseUrl = siteConfig.url;
  const currentDate = new Date().toISOString();

  // Static pages with their priorities and change frequencies
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/map`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/settlements`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/photographs`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/films`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/stay`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/history`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/people`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/music`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contribute`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  try {
    const [{ items: allEntries }, towns] = await Promise.all([
      getEntriesByCategory("all", 0, 100),
      getTownStatusSummary(),
    ]);

    const settlementPages = towns.map((town) => ({
      url: `${baseUrl}/${town.slug}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // A record no settlement owns has no page, so it has no sitemap entry either.
    const dynamicPages = allEntries.flatMap((entry) => {
      const path = placeRecordPath(entry, towns);
      if (!path) return [];

      return [
        {
          url: `${baseUrl}${path}`,
          lastModified: entry.updatedAt || currentDate,
          changeFrequency: "weekly" as const,
          priority: getDynamicPagePriority(entry.category, entry.rating),
        },
      ];
    });

    // Generate sitemap entries for MDX pages (multilingual)
    const mdxPages: MetadataRoute.Sitemap = pages.map((page) => ({
      url: `${baseUrl}/${page.slug}?lang=${page.language}`,
      lastModified: page.updatedDate || page.publishDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...settlementPages, ...dynamicPages, ...mdxPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return static pages if dynamic content fails
    return staticPages;
  }
}

/**
 * Calculate priority for dynamic pages based on category and rating
 */
function getDynamicPagePriority(
  category: string,
  rating?: number | null
): number {
  let basePriority = 0.6;

  // Adjust base priority by category
  switch (category) {
    case "Restaurant":
      basePriority = 0.7;
      break;
    case "Hotel":
      basePriority = 0.7;
      break;
    case "Heritage":
      basePriority = 0.8;
      break;
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
