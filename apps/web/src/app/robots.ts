import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/metadata";

/**
 * Generate robots.txt for Nos Ilha Cultural Heritage Platform
 *
 * Optimized for search engine discovery of Cape Verdean cultural heritage
 * and tourism content while protecting admin and authentication areas.
 */

/** Public routes crawlers are invited to index. */
const ALLOWED_PATHS = [
  "/",
  "/about",
  "/map",
  "/directory/",
  "/history",
  "/people",
  "/gallery",
  "/contact",
  "/contribute",
  "/privacy",
  "/terms",
];

/** Admin, auth and internal routes kept out of the index. */
const DISALLOWED_PATHS = [
  "/admin/",
  "/api/",
  "/login",
  "/signup",
  "/test",
  "/profile",
  "/settings",
  "/sandbox/",
  "/_next/",
];

/** Named crawlers get the same rules; only the catch-all also hides dotfiles. */
const USER_AGENTS = ["*", "Googlebot", "Bingbot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: USER_AGENTS.map((userAgent) => ({
      userAgent,
      allow: ALLOWED_PATHS,
      disallow:
        userAgent === "*"
          ? // Disallow hidden files and folders
            [...DISALLOWED_PATHS, "/.*"]
          : DISALLOWED_PATHS,
    })),
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
