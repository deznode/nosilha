import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { DirectoryCard } from "@/components/ui/directory-card";
import { getEntriesByCategory, getTownBySlug } from "@/lib/api";
import type { Town } from "@/types/town";
import { 
  MapPinIcon, 
  UserGroupIcon, 
  BuildingOfficeIcon,
  CameraIcon 
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
  let townEntries: any[] = [];
  try {
    const allEntries = await getEntriesByCategory("all");
    // Filter entries by town name (this would be better implemented with a proper API function)
    townEntries = allEntries.filter(entry => 
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
            <p className="mt-4 text-lg sm:text-xl">
              {town.description}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Town Overview */}
        <section className="bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="font-serif text-2xl font-bold text-text-primary mb-4">
                About {town.name}
              </h2>
              <p className="text-lg text-text-secondary mb-6">
                {town.description}
              </p>
              
              <h3 className="font-semibold text-lg text-text-primary mb-3">
                What Makes {town.name} Special
              </h3>
              <ul className="space-y-2 text-text-secondary">
                {town.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-ocean-blue mr-2">•</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4">
              <div className="bg-background-secondary p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <UserGroupIcon className="h-5 w-5 text-ocean-blue mr-2" />
                  <span className="font-semibold text-text-primary">Population</span>
                </div>
                <p className="text-text-secondary">{town.population || "Population information not available"}</p>
              </div>
              
              <div className="bg-background-secondary p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <MapPinIcon className="h-5 w-5 text-ocean-blue mr-2" />
                  <span className="font-semibold text-text-primary">Elevation</span>
                </div>
                <p className="text-text-secondary">{town.elevation || "Elevation information not available"}</p>
              </div>
              
              <div className="bg-background-secondary p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <BuildingOfficeIcon className="h-5 w-5 text-ocean-blue mr-2" />
                  <span className="font-semibold text-text-primary">Founded</span>
                </div>
                <p className="text-text-secondary">{town.founded || "Founding information not available"}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Photo Gallery */}
        {town.gallery && town.gallery.length > 0 && (
          <section className="mt-16">
            <h3 className="font-serif text-2xl font-bold text-text-primary mb-8">
              Photo Gallery
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              {town.gallery.map((image, index) => (
                <div key={index} className="relative h-64 overflow-hidden rounded-lg">
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
            <h3 className="font-serif text-2xl font-bold text-text-primary mb-8">
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
        <section className="mt-16 bg-gradient-to-r from-ocean-blue/10 to-valley-green/10 p-8 rounded-lg text-center">
          <CameraIcon className="h-12 w-12 text-ocean-blue mx-auto mb-4" />
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-4">
            Share Your {town.name} Experience
          </h3>
          <p className="text-lg text-text-secondary mb-6">
            Have photos or stories from {town.name}? Help us showcase this beautiful part of Brava Island.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contribute"
              className="rounded-md bg-ocean-blue px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-ocean-blue/90"
            >
              Contribute Photos
            </Link>
            <Link
              href="/map"
              className="rounded-md border-2 border-ocean-blue px-6 py-3 text-base font-semibold text-ocean-blue transition-colors hover:bg-ocean-blue hover:text-white"
            >
              View on Map
            </Link>
          </div>
        </section>

        {/* Navigation */}
        <section className="mt-16 text-center">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-6">
            Explore More of Brava
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/towns"
              className="rounded-md bg-valley-green px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-valley-green/90"
            >
              All Towns & Villages
            </Link>
            <Link
              href="/history"
              className="rounded-md border-2 border-valley-green px-6 py-3 text-base font-semibold text-valley-green transition-colors hover:bg-valley-green hover:text-white"
            >
              Learn History
            </Link>
            <Link
              href="/directory/all"
              className="rounded-md border-2 border-border-primary px-6 py-3 text-base font-semibold text-text-primary transition-colors hover:bg-text-primary hover:text-background-primary"
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
      title: 'Town Not Found | Nos Ilha',
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