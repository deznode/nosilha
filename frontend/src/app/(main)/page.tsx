import type { Metadata } from "next";
import { getEntriesByCategory } from "@/lib/api";
import { NewHomePageContent } from "@/components/pages/new-home-page-content";
import { generatePageMetadata, siteConfig } from "@/lib/metadata";
import type { PlaceSchema } from "@/types/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Discover the Soul of Brava Island",
  description:
    "The definitive cultural heritage hub connecting the global Cape Verdean diaspora to Brava Island. Explore history, people, events, traditions, and hidden gems of the Flower Island.",
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
    "Morna music",
    "Kriolu language",
    "Nova Sintra",
    "Fajã d'Agua",
    "Eugénio Tavares",
    "Cape Verde events",
    "Brava tourism",
    "interactive heritage map",
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
  return <NewHomePageContent featuredEntries={featuredEntries} />;
}
