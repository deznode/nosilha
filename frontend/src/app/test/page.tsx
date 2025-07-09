import { getEntriesByCategory } from "@/lib/api";
import { DirectoryCard } from "@/components/ui/directory-card";
import { PageHeader } from "@/components/ui/page-header";
import { NosilhaLogo } from "@/components/ui/logo";
import { Logo as Logo2 } from "@/components/ui/logo2";
import { Logo as Logo3 } from "@/components/ui/logo3";
import { Logo as Logo4 } from "@/components/ui/logo4";

// Force dynamic rendering for test page
export const dynamic = 'force-dynamic'

/**
 * An updated test page that uses the PageHeader component.
 */
export default async function TestPage() {
  // Fetch all entries from our mock API.
  const entries = await getEntriesByCategory("all");

  return (
    <main className="bg-off-white font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <NosilhaLogo />
        <Logo2 />
        <Logo3 />
        <Logo4 />
        <PageHeader
          title="Component Test Page"
          subtitle="Rendering all items from the mock API to test our DirectoryCard component."
        />
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {entries.map((entry) => (
            <DirectoryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </main>
  );
}
