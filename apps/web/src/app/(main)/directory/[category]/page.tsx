import type { Metadata } from "next";
import { getEntriesByCategory } from "@/lib/api";
import { DirectoryCategoryPageContent } from "@/components/pages/directory-category-page-content";
import {
  formatCategoryTitle,
  getCategoryFromSlug,
} from "@/lib/directory-utils";
import { generatePageMetadata, siteConfig } from "@/lib/metadata";
import type { BreadcrumbListSchema } from "@/types/metadata";

// Enable ISR with 1 hour revalidation for directory content
export const revalidate = 3600;

// Define the props for a dynamic page component in Next.js
interface DirectoryCategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

// Generate dynamic metadata for directory category pages
export async function generateMetadata({
  params,
}: DirectoryCategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const pageTitle = formatCategoryTitle(category);
  const isAllCategory = category === "all";

  const title = isAllCategory
    ? "Complete Directory - All Listings"
    : `${pageTitle} Directory`;

  const description = isAllCategory
    ? "Browse the complete directory of businesses, landmarks, beaches, and cultural sites on Brava Island, Cape Verde. Discover authentic local experiences and connect with Cape Verdean heritage."
    : `Discover the best ${pageTitle.toLowerCase()} on Brava Island, Cape Verde. Authentic local experiences, cultural heritage sites, and community-owned businesses for Cape Verdean diaspora and visitors.`;

  const keywords = isAllCategory
    ? [
        "complete directory",
        "all listings",
        "Brava Island cultural sites",
        "Cape Verde heritage",
      ]
    : [
        `${pageTitle.toLowerCase()} Brava Island`,
        `${pageTitle.toLowerCase()} Cape Verde`,
        `authentic ${pageTitle.toLowerCase()}`,
        `local ${pageTitle.toLowerCase()}`,
        `community ${pageTitle.toLowerCase()}`,
        `heritage ${pageTitle.toLowerCase()}`,
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
      ...(isAllCategory
        ? []
        : [
            {
              "@type": "ListItem" as const,
              position: 3,
              name: pageTitle,
              item: `${siteConfig.url}/directory/${category}`,
            },
          ]),
    ],
  };

  return generatePageMetadata({
    title,
    description,
    path: `/directory/${category}`,
    keywords,
    structuredData: [breadcrumbSchema],
    baseUrl: siteConfig.url,
    siteName: siteConfig.name,
    defaultImage: siteConfig.ogImage,
  });
}

export default async function DirectoryCategoryPage({
  params,
}: DirectoryCategoryPageProps) {
  const { category } = await params;
  // Convert URL slug (e.g., "hotels") to API category format (e.g., "Hotel")
  // For "all", keep as-is since the API handles it specially
  const apiCategory =
    category === "all" ? category : (getCategoryFromSlug(category) ?? category);
  const { items: entries } = await getEntriesByCategory(apiCategory);
  return <DirectoryCategoryPageContent category={category} entries={entries} />;
}
