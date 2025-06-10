import { getEntriesByCategory } from "@/lib/api"; // <-- Corrected path
import { DirectoryCard } from "@/components/ui/DirectoryCard"; // <-- Corrected path

/**
 * A test page to display DirectoryCard components using the mock API.
 * This page fetches all entries and displays them in a responsive grid.
 */
export default async function TestPage() {
  // Fetch all entries from our mock API.
  const entries = await getEntriesByCategory("all");

  return (
    <main className="bg-off-white font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-ocean-blue sm:text-4xl">
            Directory Card Test Page
          </h1>
          <p className="mt-4 text-lg text-volcanic-gray">
            Rendering all items from the mock API to test our component.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {entries.map((entry) => (
            <DirectoryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </main>
  );
}
