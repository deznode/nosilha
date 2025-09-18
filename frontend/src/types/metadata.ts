import type { DirectoryEntry } from "./directory";

/**
 * SEO Metadata Types for Nos Ilha Cultural Heritage Platform
 *
 * These types provide comprehensive TypeScript support for SEO optimization
 * including Open Graph, Twitter Cards, and structured data for tourism content.
 */

export interface NosilhaMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  openGraph: OpenGraphData;
  twitter: TwitterCardData;
  structuredData?: StructuredData[];
}

export interface OpenGraphData {
  title: string;
  description: string;
  url: string;
  siteName: string;
  images: OpenGraphImage[];
  type: "website" | "article" | "place" | "business.business";
  locale: string;
  alternateLocale?: string[];
}

export interface OpenGraphImage {
  url: string;
  width: number;
  height: number;
  alt: string;
  type?: string;
}

export interface TwitterCardData {
  card: "summary" | "summary_large_image" | "app" | "player";
  site: string;
  creator?: string;
  title: string;
  description: string;
  images: string[];
}

// Structured Data Types for Tourism and Heritage Content
export type StructuredData =
  | TouristAttractionSchema
  | TouristDestinationSchema
  | LocalBusinessSchema
  | LodgingBusinessSchema
  | RestaurantSchema
  | OrganizationSchema
  | BreadcrumbListSchema;

export interface BaseSchema {
  "@context": "https://schema.org";
  "@type": string;
}

export interface TouristAttractionSchema extends BaseSchema {
  "@type": "TouristAttraction";
  name: string;
  description: string;
  image: string[];
  address: {
    "@type": "PostalAddress";
    addressCountry: "CV";
    addressLocality: string;
  };
  geo: {
    "@type": "GeoCoordinates";
    latitude: number;
    longitude: number;
  };
  touristType?: string[];
  isAccessibleForFree?: boolean;
  url?: string;
}

export interface TouristDestinationSchema extends BaseSchema {
  "@type": "TouristDestination";
  name: string;
  description: string;
  image: string[];
  address: {
    "@type": "PostalAddress";
    addressCountry: "CV";
    addressLocality: string;
  };
  geo: {
    "@type": "GeoCoordinates";
    latitude: number;
    longitude: number;
  };
  includesAttraction?: TouristAttractionSchema[];
  touristType?: string[];
}

export interface LocalBusinessSchema extends BaseSchema {
  "@type": "LocalBusiness";
  name: string;
  description: string;
  image: string[];
  address: {
    "@type": "PostalAddress";
    addressCountry: "CV";
    addressLocality: string;
  };
  geo: {
    "@type": "GeoCoordinates";
    latitude: number;
    longitude: number;
  };
  telephone?: string;
  url?: string;
  priceRange?: string;
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
  };
}

export interface LodgingBusinessSchema extends BaseSchema {
  "@type": "LodgingBusiness";
  name: string;
  description: string;
  image: string[];
  address: {
    "@type": "PostalAddress";
    addressCountry: "CV";
    addressLocality: string;
  };
  geo: {
    "@type": "GeoCoordinates";
    latitude: number;
    longitude: number;
  };
  telephone?: string;
  url?: string;
  amenityFeature?: {
    "@type": "LocationFeatureSpecification";
    name: string;
    value: boolean;
  }[];
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
  };
}

export interface RestaurantSchema extends BaseSchema {
  "@type": "Restaurant";
  name: string;
  description: string;
  image: string[];
  address: {
    "@type": "PostalAddress";
    addressCountry: "CV";
    addressLocality: string;
  };
  geo: {
    "@type": "GeoCoordinates";
    latitude: number;
    longitude: number;
  };
  telephone?: string;
  url?: string;
  servesCuisine?: string[];
  priceRange?: string;
  openingHours?: string[];
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
  };
}

export interface OrganizationSchema extends BaseSchema {
  "@type": "Organization";
  name: string;
  description: string;
  url: string;
  logo: {
    "@type": "ImageObject";
    url: string;
    width: number;
    height: number;
  };
  contactPoint: {
    "@type": "ContactPoint";
    contactType: "customer service";
    url: string;
  };
  sameAs: string[];
  address: {
    "@type": "PostalAddress";
    addressCountry: "CV";
    addressLocality: string;
  };
}

export interface BreadcrumbListSchema extends BaseSchema {
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }[];
}

/**
 * Utility functions for generating metadata
 */
export interface MetadataGeneratorOptions {
  baseUrl: string;
  siteName: string;
  defaultImage: string;
  twitterHandle?: string;
}

export interface DirectoryEntryMetadataOptions
  extends MetadataGeneratorOptions {
  entry: DirectoryEntry;
  images?: OpenGraphImage[];
}

export interface PageMetadataOptions extends MetadataGeneratorOptions {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  images?: OpenGraphImage[];
  structuredData?: StructuredData[];
}
