import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { DirectoryEntry } from "@/types/directory";
import { DirectoryCard } from "@/components/ui/directory-card";
import { getEntriesByCategory, getTownBySlug } from "@/lib/api";
import {
  MapPinIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";

// Enable ISR with 1 hour revalidation for town content
export const revalidate = 3600;

// Define the props for the dynamic page
interface TownPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function TownPage({ params }: TownPageProps) {
  const { slug } = await params;

  // Get town data from API with graceful fallback
  const town = await getTownBySlug(slug);

  if (!town) {
    notFound();
  }

  // Fetch directory entries for this town (for now, we'll get all entries as a fallback)
  let townEntries: DirectoryEntry[] = [];
  try {
    const allEntries = await getEntriesByCategory("all");
    // Filter entries by town name (this would be better implemented with a proper API function)
    townEntries = allEntries.filter(
      (entry) =>
        entry.town && entry.town.toLowerCase().includes(town.name.toLowerCase())
    );
  } catch (error) {
    console.error("Failed to fetch entries for town:", error);
    townEntries = [];
  }

  return (
    <div className="bg-background-secondary font-sans">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <Image
          src={town.heroImage || "/images/towns/default-town.jpg"}
          alt={`Scenic view of ${town.name}, Brava Island`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center text-center text-white">
          <div className="max-w-3xl px-4">
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {town.name}
            </h1>
            <p className="mt-4 text-lg sm:text-xl">{town.description}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Town Overview */}
        <section className="bg-background-primary border-border-primary rounded-lg border p-8 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="text-text-primary mb-4 font-serif text-2xl font-bold">
                About {town.name}
              </h2>
              <p className="text-text-secondary mb-6 text-lg">
                {town.description}
              </p>

              <h3 className="text-text-primary mb-3 text-lg font-semibold">
                What Makes {town.name} Special
              </h3>
              <ul className="text-text-secondary space-y-2">
                {town.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-ocean-blue mr-2">•</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="bg-background-secondary rounded-lg p-4">
                <div className="mb-2 flex items-center">
                  <UserGroupIcon className="text-ocean-blue mr-2 h-5 w-5" />
                  <span className="text-text-primary font-semibold">
                    Population
                  </span>
                </div>
                <p className="text-text-secondary">
                  {town.population || "Population information not available"}
                </p>
              </div>

              <div className="bg-background-secondary rounded-lg p-4">
                <div className="mb-2 flex items-center">
                  <MapPinIcon className="text-ocean-blue mr-2 h-5 w-5" />
                  <span className="text-text-primary font-semibold">
                    Elevation
                  </span>
                </div>
                <p className="text-text-secondary">
                  {town.elevation || "Elevation information not available"}
                </p>
              </div>

              <div className="bg-background-secondary rounded-lg p-4">
                <div className="mb-2 flex items-center">
                  <BuildingOfficeIcon className="text-ocean-blue mr-2 h-5 w-5" />
                  <span className="text-text-primary font-semibold">
                    Founded
                  </span>
                </div>
                <p className="text-text-secondary">
                  {town.founded || "Founding information not available"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Photo Gallery */}
        {town.gallery && town.gallery.length > 0 && (
          <section className="mt-16">
            <h3 className="text-text-primary mb-8 font-serif text-2xl font-bold">
              Photo Gallery
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              {town.gallery.map((image, index) => (
                <div
                  key={index}
                  className="relative h-64 overflow-hidden rounded-lg"
                >
                  <Image
                    src={image}
                    alt={`View ${index + 1} of ${town.name}`}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Local Directory Entries */}
        {townEntries.length > 0 && (
          <section className="mt-16">
            <h3 className="text-text-primary mb-8 font-serif text-2xl font-bold">
              Places to Visit in {town.name}
            </h3>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {townEntries.map((entry) => (
                <DirectoryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        )}

        {/* Contribute Section */}
        <section className="from-ocean-blue/10 to-valley-green/10 mt-16 rounded-lg bg-gradient-to-r p-8 text-center">
          <CameraIcon className="text-ocean-blue mx-auto mb-4 h-12 w-12" />
          <h3 className="text-text-primary mb-4 font-serif text-2xl font-bold">
            Share Your {town.name} Experience
          </h3>
          <p className="text-text-secondary mb-6 text-lg">
            Have photos or stories from {town.name}? Help us showcase this
            beautiful part of Brava Island.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/contribute"
              className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-md px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105"
            >
              Contribute Photos
            </Link>
            <Link
              href="/map"
              className="border-ocean-blue text-ocean-blue hover:bg-ocean-blue rounded-md border-2 px-6 py-3 text-base font-semibold transition-colors hover:text-white"
            >
              View on Map
            </Link>
          </div>
        </section>

        {/* Navigation */}
        <section className="mt-16 text-center">
          <h3 className="text-text-primary mb-6 font-serif text-2xl font-bold">
            Explore More of Brava
          </h3>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/towns"
              className="bg-valley-green hover:bg-valley-green/90 rounded-md px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105"
            >
              All Towns & Villages
            </Link>
            <Link
              href="/history"
              className="border-valley-green text-valley-green hover:bg-valley-green rounded-md border-2 px-6 py-3 text-base font-semibold transition-colors hover:text-white"
            >
              Learn History
            </Link>
            <Link
              href="/directory/all"
              className="border-border-primary text-text-primary hover:bg-text-primary hover:text-background-primary rounded-md border-2 px-6 py-3 text-base font-semibold transition-colors"
            >
              Browse Directory
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// Generate static params for known towns - uses mock data for build-time generation
export async function generateStaticParams() {
  // Import mock data for build-time static generation
  const { getMockTowns } = await import("@/lib/mock-api");
  const towns = getMockTowns();

  return towns.map((town) => ({
    slug: town.slug,
  }));
}

// Generate metadata for SEO - uses API with fallback to mock data
export async function generateMetadata({ params }: TownPageProps) {
  const { slug } = await params;
  const town = await getTownBySlug(slug);

  if (!town) {
    return {
      title: "Town Not Found | Nos Ilha",
    };
  }

  return {
    title: `${town.name} | Towns of Brava Island | Nos Ilha`,
    description: town.description,
    openGraph: {
      title: `${town.name} - Brava Island`,
      description: town.description,
      images: [town.heroImage || "/images/towns/default-town.jpg"],
    },
  };
}
