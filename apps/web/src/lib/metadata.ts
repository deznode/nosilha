import type { Metadata } from "next";
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

/**
 * Generate comprehensive metadata for Next.js pages
 */
export function generatePageMetadata(options: PageMetadataOptions): Metadata {
  const {
    title,
    description,
    path,
    keywords = [],
    images = [],
    structuredData = [],
  } = options;

  const { url: baseUrl, name: siteName } = siteConfig;
  const url = `${baseUrl}${path}`;
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
      locale: "en_US",
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
    alternates: {
      canonical: url,
    },
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
