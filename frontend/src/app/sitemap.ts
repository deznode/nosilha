import { MetadataRoute } from "next";
import { getEntriesByCategory } from "@/lib/api";
import { siteConfig } from "@/lib/metadata";

/**
 * Generate sitemap for Nos Ilha Cultural Heritage Platform
 * 
 * Includes static pages and dynamic directory entries for optimal SEO coverage
 * supporting Cape Verdean diaspora discovery through search engines.
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
      url: `${baseUrl}/directory/all`,
      lastModified: currentDate,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/directory/restaurant`,
      lastModified: currentDate,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/directory/hotel`,
      lastModified: currentDate,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/directory/landmark`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/directory/beach`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/towns`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
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
      url: `${baseUrl}/media/photos`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/media/music`,
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
    // Fetch all directory entries for dynamic pages
    const allEntries = await getEntriesByCategory("all");
    
    // Generate sitemap entries for each directory item
    const dynamicPages = allEntries.map((entry) => ({
      url: `${baseUrl}/directory/entry/${entry.slug}`,
      lastModified: entry.updatedAt || currentDate,
      changeFrequency: "weekly" as const,
      priority: getDynamicPagePriority(entry.category, entry.rating),
    }));

    // Add town-specific pages if we have location data
    const townPages = getTownPages(allEntries, baseUrl, currentDate);

    return [...staticPages, ...dynamicPages, ...townPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return static pages if dynamic content fails
    return staticPages;
  }
}

/**
 * Calculate priority for dynamic pages based on category and rating
 */
function getDynamicPagePriority(category: string, rating?: number): number {
  let basePriority = 0.6;

  // Adjust base priority by category
  switch (category) {
    case "Restaurant":
      basePriority = 0.7;
      break;
    case "Hotel":
      basePriority = 0.7;
      break;
    case "Landmark":
      basePriority = 0.8;
      break;
    case "Beach":
      basePriority = 0.8;
      break;
  }

  // Boost priority for highly rated entries
  if (rating && rating >= 4.0) {
    basePriority = Math.min(basePriority + 0.1, 1.0);
  }

  return Math.round(basePriority * 10) / 10; // Round to 1 decimal place
}

/**
 * Generate town-specific pages if we have unique town data
 */
function getTownPages(
  entries: any[],
  baseUrl: string,
  currentDate: string
): MetadataRoute.Sitemap {
  const uniqueTowns = [...new Set(entries.map((entry) => entry.town))];
  
  return uniqueTowns.map((town) => ({
    url: `${baseUrl}/towns/${encodeURIComponent(town.toLowerCase().replace(/\s+/g, "-"))}`,
    lastModified: currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
}