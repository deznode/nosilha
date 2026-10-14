import type { Metadata } from "next";
import {
  BCP47_TAGS,
  DEFAULT_LOCALE,
  OG_LOCALES,
  PORTUGUESE_ENABLED,
  type Locale,
} from "@/i18n/config";
import { getPathname } from "@/i18n/navigation";
import type {
  OpenGraphImage,
  PageMetadataOptions,
  StructuredData,
  OrganizationSchema,
} from "@/types/metadata";

/**
 * SEO Metadata Generation Utilities for Nos Ilha Cultural Heritage Platform
 *
 * This module provides comprehensive metadata generation for tourism content,
 * cultural heritage sites, and business listings with proper structured data.
 */

// Base configuration for the site
export const siteConfig = {
  name: "Nos Ilha",
  title: "Nos Ilha - Your Guide to Brava, Cape Verde",
  description:
    "The definitive cultural heritage hub for Brava Island, Cape Verde. Preserve and celebrate Cape Verdean culture, explore authentic heritage experiences, connect with the global diaspora, and discover local cultural sites and businesses.",
  url:
    process.env.NODE_ENV === "production"
      ? "https://nosilha.com"
      : "http://localhost:3000",
  ogImage: "/images/og-image.jpg",
  twitterHandle: "@nosilha_cv",
  keywords: [
    "Brava Island",
    "Cape Verde",
    "Cabo Verde",
    "cultural heritage",
    "Cape Verdean culture",
    "heritage preservation",
    "diaspora connection",
    "authentic experiences",
    "cultural sites",
    "local businesses",
    "island heritage",
    "Atlantic islands",
  ],
};

/** The absolute address of a page in one language. */
export function localizedUrl(path: string, locale: Locale): string {
  return `${siteConfig.url}${getPathname({ href: path, locale })}`;
}

interface LocaleMetadataOptions {
  /** The page's address without a locale prefix. */
  path: string;
  locale: Locale;
  hasPortuguese?: boolean;
  /** Overridable so the switched-on behaviour can be tested. */
  portugueseEnabled?: boolean;
}

/**
 * The canonical address and language alternates of a page. Spec 041 FR-008.
 *
 * Each language is canonical at its own address. Alternates (`en`, `pt-PT`,
 * `x-default`) are declared only while Portuguese is enabled and the page has a
 * Portuguese version, so nothing points at `/pt` before it is public.
 */
export function localeAlternates({
  path,
  locale,
  hasPortuguese = true,
  portugueseEnabled = PORTUGUESE_ENABLED,
}: LocaleMetadataOptions): NonNullable<Metadata["alternates"]> {
  const canonical = localizedUrl(path, locale);
  if (!portugueseEnabled || !hasPortuguese) return { canonical };

  const english = localizedUrl(path, DEFAULT_LOCALE);
  return {
    canonical,
    languages: {
      [DEFAULT_LOCALE]: english,
      [BCP47_TAGS.pt]: localizedUrl(path, "pt"),
      "x-default": english,
    },
  };
}

/**
 * Adds the locale tags to metadata a page built by hand: its own canonical, the
 * language alternates, and `og:locale` on a Portuguese page. Everything else the
 * page wrote is passed through, so its English tags stay as they were.
 */
export function withLocaleMetadata(
  metadata: Metadata,
  options: LocaleMetadataOptions
): Metadata {
  const { locale } = options;
  const localized: Metadata = {
    ...metadata,
    alternates: localeAlternates(options),
  };

  // Only touched when the page wrote one: an `openGraph` key, even an undefined
  // one, replaces the block the page would otherwise inherit from the layout.
  if (metadata.openGraph && locale !== DEFAULT_LOCALE) {
    localized.openGraph = { ...metadata.openGraph, locale: OG_LOCALES[locale] };
  }

  return localized;
}

/**
 * Generate comprehensive metadata for Next.js pages
 */
export function generatePageMetadata(
  options: PageMetadataOptions & { portugueseEnabled?: boolean }
): Metadata {
  const {
    title,
    description,
    path,
    locale,
    hasPortuguese,
    portugueseEnabled,
    keywords = [],
    images = [],
    structuredData = [],
  } = options;

  const { url: baseUrl, name: siteName } = siteConfig;
  const url = localizedUrl(path, locale);
  // Don't append siteName here - let Next.js title template handle it
  const fullTitle = title;

  // Dynamic OG image via /api/og route
  const dynamicOgImage: OpenGraphImage = {
    url: `${baseUrl}/api/og?type=default&title=${encodeURIComponent(title)}`,
    width: 1200,
    height: 630,
    alt: `${title} - ${siteName}`,
    type: "image/png",
  };

  const ogImages = images.length > 0 ? images : [dynamicOgImage];

  return {
    metadataBase: new URL(baseUrl),
    title: fullTitle,
    description,
    keywords: [...siteConfig.keywords, ...keywords],
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALES[locale],
      url,
      title: fullTitle,
      description,
      siteName,
      images: ogImages.map((img) => ({
        url: img.url,
        width: img.width,
        height: img.height,
        alt: img.alt,
        type: img.type as
          "image/jpeg" | "image/png" | "image/webp" | "image/gif" | undefined,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      site: siteConfig.twitterHandle,
      images: ogImages.map((img) => img.url),
    },
    alternates: localeAlternates({
      path,
      locale,
      hasPortuguese,
      portugueseEnabled,
    }),
    other:
      structuredData.length > 0
        ? {
            "structured-data": JSON.stringify(structuredData),
          }
        : undefined,
  };
}

/**
 * Generate organization structured data for the main site
 */
export function generateOrganizationSchema(
  baseUrl: string = siteConfig.url
): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    description: siteConfig.description,
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/images/logo.png`,
      width: 400,
      height: 400,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: `${baseUrl}/contact`,
    },
    sameAs: [
      // Add social media URLs when available
      "https://twitter.com/nosilha_cv",
      "https://www.facebook.com/nosilha.cv",
      "https://instagram.com/nosilha",
      "https://www.youtube.com/@nosilha",
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "CV",
      addressLocality: "Brava Island",
    },
  };
}

/**
 * Create structured data script element for page injection
 */
export function createStructuredDataScript(data: StructuredData[]): string {
  if (data.length === 0) return "";

  const jsonLd = data.length === 1 ? data[0] : data;
  return JSON.stringify(jsonLd);
}
