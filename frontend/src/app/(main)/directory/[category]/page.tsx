import type { Metadata } from "next";
import { getEntriesByCategory } from "@/lib/api";
import { DirectoryCard } from "@/components/ui/directory-card";
import { PageHeader } from "@/components/ui/page-header";
import { generatePageMetadata, siteConfig } from "@/lib/metadata";
import type { BreadcrumbListSchema } from "@/types/metadata";
import Link from "next/link";

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
    ? ["complete directory", "all listings", "Brava Island businesses", "Cape Verde tourism"]
    : [
        `${pageTitle.toLowerCase()} Brava Island`,
        `${pageTitle.toLowerCase()} Cape Verde`,
        `best ${pageTitle.toLowerCase()}`,
        `authentic ${pageTitle.toLowerCase()}`,
        `local ${pageTitle.toLowerCase()}`,
        `community ${pageTitle.toLowerCase()}`,
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
        item: `${siteConfig.url}/directory/all`,
      },
      ...(isAllCategory ? [] : [
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

/**
 * A helper function to format the category name from the URL for display.
 * e.g., "restaurant" -> "Restaurant"
 */
function formatCategoryTitle(category: string): string {
  if (!category) return "Directory";
  // Decode URI component for categories like "fazendas%20historicas"
  const decodedCategory = decodeURIComponent(category);
  return decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1);
}

/**
 * This is a dynamic server component that displays a list of directory
 * entries based on the category provided in the URL.
 */
export default async function DirectoryCategoryPage({
  params,
}: DirectoryCategoryPageProps) {
  const { category } = await params;
  const entries = await getEntriesByCategory(category);
  const pageTitle = formatCategoryTitle(category);

  return (
    <div className="bg-background-secondary font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title={pageTitle}
          subtitle={`Browse all ${pageTitle.toLowerCase()} listings on Brava Island.`}
        />

        {entries.length > 0 ? (
          // If entries are found, display them in a grid
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {entries.map((entry) => (
              <DirectoryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          // If no entries are found, display a helpful message
          <div className="mt-16 text-center">
            <p className="text-xl text-text-secondary">
              No listings found in the "{pageTitle}" category.
            </p>
            <p className="mt-2 text-base text-text-tertiary">
              Please try another category or check back later.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-md bg-ocean-blue px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-ocean-blue/90 focus:outline-none focus:ring-2 focus:ring-ocean-blue focus:ring-offset-2"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
