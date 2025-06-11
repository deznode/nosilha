import { getEntriesByCategory } from "@/lib/api";
import { DirectoryCard } from "@/components/ui/DirectoryCard";
import { PageHeader } from "@/components/ui/PageHeader";

/**
 * An updated test page that uses the PageHeader component.
 */
export default async function TestPage() {
  // Fetch all entries from our mock API.
  const entries = await getEntriesByCategory("all");

  return (
    <main className="bg-off-white font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        {/*
          The PageHeader component is now used directly.
          It handles its own internal layout and centering.
        */}
        <PageHeader
          title="Component Test Page"
          subtitle="Rendering all items from the mock API to test our DirectoryCard component."
        />

        {/* A responsive grid for the Directory Cards, with a top margin for spacing */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {entries.map((entry) => (
            <DirectoryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </main>
  );
}
