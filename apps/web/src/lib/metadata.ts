import type { Metadata } from "next";
import type {
  OpenGraphImage,
  DirectoryEntryMetadataOptions,
  PageMetadataOptions,
  StructuredData,
  TouristAttractionSchema,
  RestaurantSchema,
  LodgingBusinessSchema,
  BreadcrumbListSchema,
  OrganizationSchema,
} from "@/types/metadata";
import type { DirectoryEntry } from "@/types/directory";

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
    baseUrl = siteConfig.url,
    siteName = siteConfig.name,
    defaultImage = siteConfig.ogImage,
  } = options;

  const url = `${baseUrl}${path}`;
  // Don't append siteName here - let Next.js title template handle it
  const fullTitle = title;

  // Default Open Graph image
  const defaultOgImage: OpenGraphImage = {
    url: `${baseUrl}${defaultImage}`,
    width: 1200,
    height: 630,
    alt: `${title} - ${siteName}`,
    type: "image/jpeg",
  };

  const ogImages = images.length > 0 ? images : [defaultOgImage];

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
          | "image/jpeg"
          | "image/png"
          | "image/webp"
          | "image/gif"
          | undefined,
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
 * Generate metadata for directory entry pages (businesses, landmarks, etc.)
 */
export function generateDirectoryEntryMetadata(
  options: DirectoryEntryMetadataOptions
): Metadata {
  const {
    entry,
    images = [],
    baseUrl = siteConfig.url,
    siteName = siteConfig.name,
    defaultImage = siteConfig.ogImage,
  } = options;

  const title = `${entry.name} - ${entry.category} in ${entry.town}`;
  const description =
    entry.description ||
    `Discover ${entry.name}, a wonderful ${entry.category.toLowerCase()} located in ${entry.town}, Brava Island, Cape Verde.`;

  const _url = `${baseUrl}/directory/entry/${entry.slug}`;

  // Use entry image if available, fallback to default
  const entryImages: OpenGraphImage[] = [];

  if (entry.imageUrl) {
    entryImages.push({
      url: entry.imageUrl,
      width: 1200,
      height: 630,
      alt: `${entry.name} in ${entry.town}, Brava Island`,
      type: "image/jpeg",
    });
  }

  // Add any additional provided images
  entryImages.push(...images);

  // Fallback to default if no images
  if (entryImages.length === 0) {
    entryImages.push({
      url: `${baseUrl}${defaultImage}`,
      width: 1200,
      height: 630,
      alt: `${entry.name} - ${siteName}`,
      type: "image/jpeg",
    });
  }

  // Generate appropriate structured data based on entry category
  const structuredData: StructuredData[] = [];

  switch (entry.category) {
    case "Restaurant":
      if (entry.details && "cuisine" in entry.details) {
        structuredData.push(generateRestaurantSchema(entry, baseUrl));
      }
      break;
    case "Hotel":
      structuredData.push(generateLodgingSchema(entry, baseUrl));
      break;
    case "Heritage":
    case "Nature":
    case "Beach":
      structuredData.push(generateTouristAttractionSchema(entry, baseUrl));
      break;
  }

  // Add breadcrumb structured data
  structuredData.push(generateBreadcrumbSchema(entry, baseUrl));

  const keywords = [
    entry.name,
    entry.category,
    entry.town,
    "Brava Island",
    "Cape Verde",
    `${entry.category} in ${entry.town}`,
    `${entry.town} ${entry.category.toLowerCase()}`,
  ];

  if (
    entry.category === "Restaurant" &&
    entry.details &&
    "cuisine" in entry.details
  ) {
    keywords.push(...entry.details.cuisine);
  }

  return generatePageMetadata({
    title,
    description,
    path: `/directory/entry/${entry.slug}`,
    keywords,
    images: entryImages,
    structuredData,
    baseUrl,
    siteName,
    defaultImage,
  });
}

/**
 * Generate structured data for restaurants
 */
function generateRestaurantSchema(
  entry: DirectoryEntry,
  baseUrl: string
): RestaurantSchema {
  const restaurant: RestaurantSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: entry.name,
    description: entry.description,
    image: entry.imageUrl ? [entry.imageUrl] : [],
    address: {
      "@type": "PostalAddress",
      addressCountry: "CV",
      addressLocality: entry.town,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: entry.latitude,
      longitude: entry.longitude,
    },
    url: `${baseUrl}/directory/entry/${entry.slug}`,
  };

  if (
    entry.details &&
    "phoneNumber" in entry.details &&
    entry.details.phoneNumber
  ) {
    restaurant.telephone = entry.details.phoneNumber;
  }

  if (entry.details && "cuisine" in entry.details) {
    restaurant.servesCuisine = entry.details.cuisine;
  }

  if (
    entry.details &&
    "openingHours" in entry.details &&
    entry.details.openingHours
  ) {
    restaurant.openingHours = [entry.details.openingHours];
  }

  if (entry.rating && entry.reviewCount > 0) {
    restaurant.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: entry.rating,
      reviewCount: entry.reviewCount,
    };
  }

  return restaurant;
}

/**
 * Generate structured data for hotels/lodging
 */
function generateLodgingSchema(
  entry: DirectoryEntry,
  baseUrl: string
): LodgingBusinessSchema {
  const lodging: LodgingBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: entry.name,
    description: entry.description,
    image: entry.imageUrl ? [entry.imageUrl] : [],
    address: {
      "@type": "PostalAddress",
      addressCountry: "CV",
      addressLocality: entry.town,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: entry.latitude,
      longitude: entry.longitude,
    },
    url: `${baseUrl}/directory/entry/${entry.slug}`,
  };

  if (
    entry.details &&
    "phoneNumber" in entry.details &&
    entry.details.phoneNumber
  ) {
    lodging.telephone = entry.details.phoneNumber;
  }

  if (entry.details && "amenities" in entry.details) {
    lodging.amenityFeature = entry.details.amenities.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity,
      value: true,
    }));
  }

  if (entry.rating && entry.reviewCount > 0) {
    lodging.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: entry.rating,
      reviewCount: entry.reviewCount,
    };
  }

  return lodging;
}

/**
 * Generate structured data for tourist attractions (landmarks, beaches)
 */
function generateTouristAttractionSchema(
  entry: DirectoryEntry,
  baseUrl: string
): TouristAttractionSchema {
  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: entry.name,
    description: entry.description,
    image: entry.imageUrl ? [entry.imageUrl] : [],
    address: {
      "@type": "PostalAddress",
      addressCountry: "CV",
      addressLocality: entry.town,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: entry.latitude,
      longitude: entry.longitude,
    },
    url: `${baseUrl}/directory/entry/${entry.slug}`,
    touristType: [entry.category.toLowerCase()],
    isAccessibleForFree: true,
  };
}

/**
 * Generate breadcrumb structured data for directory entries
 */
function generateBreadcrumbSchema(
  entry: DirectoryEntry,
  baseUrl: string
): BreadcrumbListSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Directory",
        item: `${baseUrl}/directory/all`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: entry.category,
        item: `${baseUrl}/directory/${entry.category.toLowerCase()}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: entry.name,
        item: `${baseUrl}/directory/entry/${entry.slug}`,
      },
    ],
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
