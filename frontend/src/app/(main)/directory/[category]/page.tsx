import { getEntriesByCategory } from "@/lib/api";
import { DirectoryCard } from "@/components/ui/directory-card";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";

// Enable ISR with 1 hour revalidation for directory content
export const revalidate = 3600;

// Define the props for a dynamic page component in Next.js
interface DirectoryCategoryPageProps {
  params: Promise<{
    category: string;
  }>;
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
    <div className="bg-off-white dark:bg-gray-900 font-sans">
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
            <p className="text-xl text-volcanic-gray dark:text-gray-300">
              No listings found in the "{pageTitle}" category.
            </p>
            <p className="mt-2 text-base text-volcanic-gray dark:text-gray-400">
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
