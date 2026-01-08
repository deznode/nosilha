import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/metadata";

/**
 * Generate robots.txt for Nos Ilha Cultural Heritage Platform
 *
 * Optimized for search engine discovery of Cape Verdean cultural heritage
 * and tourism content while protecting admin and authentication areas.
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/map",
          "/directory/",
          "/history",
          "/people",
          "/media/",
          "/contact",
          "/contribute",
          "/privacy",
          "/terms",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/login",
          "/signup",
          "/test",
          "/_next/",
          "/.*", // Disallow hidden files and folders
        ],
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/about",
          "/map",
          "/directory/",
          "/history",
          "/people",
          "/media/music",
          "/contact",
          "/contribute",
          "/privacy",
          "/terms",
        ],
        disallow: ["/admin/", "/api/", "/login", "/signup", "/test", "/_next/"],
      },
      {
        userAgent: "Bingbot",
        allow: [
          "/",
          "/about",
          "/map",
          "/directory/",
          "/history",
          "/people",
          "/media/",
          "/contact",
          "/contribute",
          "/privacy",
          "/terms",
        ],
        disallow: ["/admin/", "/api/", "/login", "/signup", "/test", "/_next/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
