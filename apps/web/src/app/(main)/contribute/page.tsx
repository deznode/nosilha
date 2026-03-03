import { cacheLife } from "next/cache";
import { ContributePageContent } from "@/components/pages/contribute-page-content";

export default async function ContributePage() {
  "use cache";
  cacheLife("max");
  return <ContributePageContent />;
}

// Generate metadata for SEO
export async function generateMetadata() {
  return {
    title: "Contribute to Nos Ilha | Help Build Our Community Guide",
    description:
      "Help us build the most comprehensive guide to Brava Island by sharing your knowledge, photos, and experiences with the Nos Ilha community.",
    openGraph: {
      title: "Contribute to Nos Ilha",
      description:
        "Share your photos, stories, and knowledge to help preserve and showcase the beauty of Brava Island.",
      images: ["/images/contribute/community-hero.jpg"],
    },
  };
}
