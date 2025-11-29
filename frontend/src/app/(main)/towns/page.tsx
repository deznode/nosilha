import { getTowns } from "@/lib/api";
import { TownsPageContent } from "@/components/pages/towns-page-content";

// Enable ISR with 2 hour revalidation for towns content
export const revalidate = 7200;

export default async function TownsPage() {
  // Fetch towns from API with graceful fallback to mock data
  const towns = await getTowns();

  // Separate featured towns (Nova Sintra and Furna) from others
  const featuredTowns = towns.filter(
    (town) => town.slug === "nova-sintra" || town.slug === "furna"
  );
  const otherTowns = towns.filter(
    (town) => town.slug !== "nova-sintra" && town.slug !== "furna"
  );

  return (
    <TownsPageContent featuredTowns={featuredTowns} otherTowns={otherTowns} />
  );
}

// Generate metadata for SEO
export async function generateMetadata() {
  return {
    title: "Towns & Villages of Brava Island | Nos Ilha",
    description:
      "Discover Brava Island's authentic settlements: UNESCO-listed Nova Sintra, volcanic crater harbor Furna, natural pools of Fajã de Água, and historic pilgrimage sites.",
    openGraph: {
      title: "Towns & Villages - Brava Island",
      description:
        "Explore authentic Cape Verdean communities from UNESCO heritage sites to volcanic crater harbors, shaped by morna music traditions and maritime heritage.",
      images: ["/images/towns/brava-towns-overview.jpg"],
    },
  };
}
