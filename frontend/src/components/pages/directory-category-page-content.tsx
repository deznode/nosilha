import { DirectoryCard } from "@/components/ui/directory-card";
import { PageHeader } from "@/components/ui/page-header";
import type { DirectoryEntry } from "@/types/directory";
import Link from "next/link";

export interface DirectoryCategoryPageContentProps {
  category: string;
  entries: DirectoryEntry[];
}

export function DirectoryCategoryPageContent({
  category,
  entries,
}: DirectoryCategoryPageContentProps) {
  const pageTitle = formatCategoryTitle(category);

  return (
    <div className="bg-background-secondary font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title={pageTitle}
          subtitle={`Browse all ${pageTitle.toLowerCase()} listings on Brava Island.`}
        />

        {entries.length > 0 ? (
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {entries.map((entry) => (
              <DirectoryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center">
            <p className="text-text-secondary text-xl">
              No listings found in the &quot;{pageTitle}&quot; category.
            </p>
            <p className="text-text-tertiary mt-2 text-base">
              Please try another category or check back later.
            </p>
            <Link
              href="/"
              className="bg-ocean-blue hover:bg-ocean-blue/90 focus:ring-ocean-blue mt-6 inline-block rounded-md px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function formatCategoryTitle(category: string): string {
  if (!category) return "Directory";
  const decodedCategory = decodeURIComponent(category);
  return decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1);
}
