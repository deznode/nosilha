import Link from "next/link";
import Image from "next/image";
import { getEntriesByCategory } from "@/lib/api";
import { DirectoryCard } from "@/components/ui/directory-card";
import { PageHeader } from "@/components/ui/page-header";

// Convert the page to an async function to fetch data on the server
export default async function HomePage() {
  // Fetch entries for the "Featured Highlights" section
  const featuredEntries = await getEntriesByCategory("all");

  return (
    <>
      {/* Hero Section (from previous task) */}
      <section className="relative flex h-[calc(100vh-81px)] items-center justify-center text-center text-white">
        <Image
          src="https://picsum.photos/1600/900?random=10"
          alt="A scenic, panoramic view of Brava, Cape Verde's coastline"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
        <div className="relative z-10 max-w-4xl p-4">
          <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Discover the Soul of Brava
          </h1>
          <p className="mt-6 text-lg leading-8 sm:text-xl">
            Your journey into the heart of Cape Verde's most enchanting and
            untouched island begins here.
          </p>
          <div className="mt-10">
            <Link
              href="/map"
              className="rounded-md bg-ocean-blue px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-ocean-blue/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean-blue"
            >
              Explore the Interactive Map
            </Link>
          </div>
        </div>
      </section>

      {/* Task 2: Featured Items Section */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <PageHeader
            title="Featured Highlights"
            subtitle="Get a glimpse of the unique places and experiences Brava has to offer."
          />
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-4 md:grid-cols-2">
            {/* Display the first 4 entries from the API call */}
            {featuredEntries.slice(0, 4).map((entry) => (
              <DirectoryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
