import { MetadataRoute } from "next";
import { DEFAULT_LOCALE, enabledLocales } from "@/i18n/config";
import { withLocale } from "@/i18n/paths";
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
  "/settlements",
  "/photographs",
  "/films",
  "/stay",
  "/history",
  "/people",
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

/** Route handlers and Next internals have no address under a locale prefix. */
const UNPREFIXED_ONLY = ["/api/", "/_next/"];

/** Each enabled language beyond English repeats the page paths under its prefix. */
function disallowedPaths(): string[] {
  const translated = enabledLocales()
    .filter((locale) => locale !== DEFAULT_LOCALE)
    .flatMap((locale) =>
      DISALLOWED_PATHS.filter((path) => !UNPREFIXED_ONLY.includes(path)).map(
        (path) => withLocale(path, locale)
      )
    );

  return [...DISALLOWED_PATHS, ...translated];
}

/** Named crawlers get the same rules; only the catch-all also hides dotfiles. */
const USER_AGENTS = ["*", "Googlebot", "Bingbot"];

export default function robots(): MetadataRoute.Robots {
  const disallowed = disallowedPaths();

  return {
    rules: USER_AGENTS.map((userAgent) => ({
      userAgent,
      allow: ALLOWED_PATHS,
      disallow:
        userAgent === "*"
          ? // Disallow hidden files and folders
            [...disallowed, "/.*"]
          : disallowed,
    })),
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
