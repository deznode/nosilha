import type { Metadata } from "next";
import { getEntriesByCategory } from "@/lib/api";
import { HomePageContent } from "@/components/pages/home-page-content";
import { generatePageMetadata, siteConfig } from "@/lib/metadata";
import type { PlaceSchema } from "@/types/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Discover the Soul of Brava Island",
  description:
    "Preserve and celebrate authentic Cape Verdean culture and heritage on Brava Island. Connect with the global diaspora, explore cultural sites, discover local heritage, and honor the traditions that define our island community.",
  path: "/",
  keywords: [
    "Brava Island cultural heritage",
    "Cape Verdean culture",
    "heritage preservation",
    "Cape Verdean diaspora",
    "island cultural hub",
    "cultural heritage platform",
    "Brava Island traditions",
    "Cape Verde heritage",
    "Atlantic islands culture",
    "authentic Cape Verdean experiences",
  ],
  structuredData: [
    {
      "@context": "https://schema.org",
      "@type": "Place",
      additionalType: "https://schema.org/LandmarksOrHistoricalBuildings",
      name: "Brava Island, Cape Verde",
      description:
        "The flower island of Cape Verde, a cultural heritage hub preserving Cape Verdean traditions, known for its lush landscapes, rich cultural memory, and authentic heritage experiences.",
      image: [`${siteConfig.url}/images/hero.jpg`],
      address: {
        "@type": "PostalAddress",
        addressCountry: "CV",
        addressLocality: "Brava Island",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 14.8676,
        longitude: -24.7098,
      },
    } as PlaceSchema,
  ],
  baseUrl: siteConfig.url,
  siteName: siteConfig.name,
  defaultImage: siteConfig.ogImage,
});

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { items: featuredEntries } = await getEntriesByCategory("all");
  return <HomePageContent featuredEntries={featuredEntries} />;
}
