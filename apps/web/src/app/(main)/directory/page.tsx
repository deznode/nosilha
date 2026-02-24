import type { Metadata } from "next";
import { getEntriesByCategory } from "@/lib/api";
import { DirectoryCategoryPageContent } from "@/components/pages/directory-category-page-content";
import { generatePageMetadata, siteConfig } from "@/lib/metadata";
import type { BreadcrumbListSchema } from "@/types/metadata";

// Enable ISR with 1 hour revalidation for directory content
export const revalidate = 3600;

interface DirectoryPageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    town?: string;
    sort?: string;
  }>;
}

// Generate metadata for the unified directory page
export async function generateMetadata(): Promise<Metadata> {
  const title = "Directory - Discover Brava Island";
  const description =
    "Browse the complete directory of restaurants, hotels, beaches, and landmarks on Brava Island, Cape Verde. Discover authentic local experiences and connect with Cape Verdean heritage.";

  const keywords = [
    "Brava Island directory",
    "Cape Verde restaurants",
    "Cape Verde hotels",
    "Brava beaches",
    "Brava landmarks",
    "Cape Verdean heritage",
    "cultural sites",
  ];

  // Generate breadcrumb structured data
  const breadcrumbSchema: BreadcrumbListSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Directory",
        item: `${siteConfig.url}/directory`,
      },
    ],
  };

  return generatePageMetadata({
    title,
    description,
    path: "/directory",
    keywords,
    structuredData: [breadcrumbSchema],
    baseUrl: siteConfig.url,
    siteName: siteConfig.name,
    defaultImage: siteConfig.ogImage,
  });
}

export default async function DirectoryPage({
  searchParams,
}: DirectoryPageProps) {
  const { page: pageParam, q, town, sort } = await searchParams;
  const page = Math.max(0, parseInt(pageParam || "0", 10) || 0);
  const size = 20;

  const result = await getEntriesByCategory("all", page, size, q, town, sort);

  return (
    <DirectoryCategoryPageContent
      category="all"
      entries={result.items}
      pagination={result.pagination}
      initialFilters={{ page, q, town, sort }}
      showCategoryFilter={true}
    />
  );
}
