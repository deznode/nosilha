import { AboutPageContent } from "@/components/pages/about-page-content";

// Static page - no revalidation needed
export const dynamic = "force-static";

export default function AboutPage() {
  return <AboutPageContent />;
}

// Generate metadata for SEO
export async function generateMetadata() {
  return {
    title: "About Nos Ilha - Community-Driven Platform for Brava Island",
    description:
      "Learn about Nos Ilha, a volunteer-driven, open-source platform celebrating the cultural heritage and natural beauty of Brava Island, Cape Verde.",
    openGraph: {
      title: "About Nos Ilha - Community-Driven Heritage Platform",
      description:
        "A volunteer-supported, open-source platform preserving and sharing the cultural heritage of Brava Island.",
      images: ["/images/about/community-collaboration.jpg"],
    },
  };
}
