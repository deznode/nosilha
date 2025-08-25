import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/ui/page-header";
import { getTowns } from "@/lib/api";
import type { Town } from "@/types/town";
import {
  MapPinIcon,
  UserGroupIcon,
  CameraIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

// Enable ISR with 2 hour revalidation for towns content
export const revalidate = 7200;

export default async function TownsPage() {
  // Fetch towns from API with graceful fallback to mock data
  const towns = await getTowns();

  // Separate featured towns (Nova Sintra and Furna) from others
  const featuredTowns = towns.filter(
    (town) => town.slug === "nova-sintra" || town.slug === "furna"
  );
  const otherTowns = towns.filter(
    (town) => town.slug !== "nova-sintra" && town.slug !== "furna"
  );

  return (
    <div className="bg-background-secondary font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Towns & Villages"
          subtitle="Discover the charming settlements scattered across Brava Island, each with its own unique character and story."
        />

        {/* Introduction Section */}
        <section className="mt-16 bg-background-primary p-8 rounded-lg shadow-sm border border-border-primary">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <h2 className="font-serif text-3xl font-bold text-text-primary mb-4">
                Island Communities
              </h2>
              <p className="text-lg text-text-secondary mb-4">
                Our island's settlements tell stories written in stone and song.
                Each village on Brava has been shaped by the dramatic forces
                that created our volcanic landscape and the maritime heritage
                that connected us to the world. From Nova Sintra's heritage
                colonial architecture to Furna's ancient crater harbor, these
                communities reflect centuries of Cape Verdean resilience and
                creativity.
              </p>
              <p className="text-text-secondary">
                Walking through our villages, you'll discover the authentic{" "}
                <em>morabeza </em>
                hospitality that welcomes every visitor as family, and hear the
                musical traditions that gave birth to <em>morna</em>—the soulful
                melodies that carry our deepest emotions of <em>sodade</em> and
                connection to home.
              </p>
            </div>
            <div className="relative h-64 lg:h-80">
              <Image
                src="/images/towns/brava-towns-overview.jpg"
                alt="Panoramic view of Brava Island's settlements from the famous road of 99 turns"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Featured Towns */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-8">
            Our Main Communities
          </h3>

          <div className="grid gap-8 md:grid-cols-2">
            {featuredTowns.map((town) => (
              <div
                key={town.slug}
                className="bg-background-primary rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-border-primary"
              >
                <div className="relative h-48">
                  <Image
                    src={town.heroImage || "/images/towns/default-town.jpg"}
                    alt={`View of ${town.name}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h4 className="font-serif text-xl font-bold text-text-primary mb-2">
                    {town.name}
                  </h4>
                  <p className="text-text-secondary mb-4">{town.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center text-text-secondary">
                      <UserGroupIcon className="h-4 w-4 text-ocean-blue mr-2" />
                      {town.population || "Population unknown"}
                    </div>
                    <div className="flex items-center text-text-secondary">
                      <MapPinIcon className="h-4 w-4 text-ocean-blue mr-2" />
                      {town.elevation || "Elevation unknown"}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-text-primary mb-2">
                      Highlights:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {town.highlights.map((highlight, index) => (
                        <span
                          key={index}
                          className="text-xs bg-ocean-blue/10 text-ocean-blue px-2 py-1 rounded"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/towns/${town.slug}`}
                    className="inline-flex items-center text-ocean-blue hover:text-ocean-blue/80 font-medium"
                  >
                    Explore {town.name} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Other Towns */}
        <section className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-8">
            Hidden Gems
          </h3>

          <div className="grid gap-6 md:grid-cols-2">
            {otherTowns.map((town) => (
              <div
                key={town.slug}
                className="bg-background-primary p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-border-primary"
              >
                <div className="flex items-start space-x-4">
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <Image
                      src={town.heroImage || "/images/towns/default-town.jpg"}
                      alt={`View of ${town.name}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-text-primary mb-1">
                      {town.name}
                    </h4>
                    <p className="text-sm text-text-secondary mb-2">
                      {town.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-text-secondary mb-2">
                      <span className="flex items-center">
                        <UserGroupIcon className="h-3 w-3 mr-1" />
                        {town.population || "Population unknown"}
                      </span>
                      <span className="flex items-center">
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        {town.elevation || "Elevation unknown"}
                      </span>
                    </div>
                    <Link
                      href={`/towns/${town.slug}`}
                      className="text-sm text-ocean-blue hover:text-ocean-blue/80 font-medium"
                    >
                      Learn more →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Map CTA */}
        <section className="mt-16 bg-gradient-to-r from-ocean-blue/10 to-valley-green/10 p-8 rounded-lg text-center">
          <MapPinIcon className="h-12 w-12 text-ocean-blue mx-auto mb-4" />
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-4">
            Explore on the Interactive Map
          </h3>
          <p className="text-lg text-text-secondary mb-6">
            See the locations of all towns and discover points of interest in
            each community.
          </p>
          <Link
            href="/map"
            className="rounded-md bg-ocean-blue px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-ocean-blue/90"
          >
            View Map
          </Link>
        </section>

        {/* Contribute Section */}
        <section className="mt-16 text-center">
          <CameraIcon className="h-12 w-12 text-valley-green mx-auto mb-4" />
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-4">
            Share Your Town Stories
          </h3>
          <p className="text-lg text-text-secondary mb-6">
            Help us build a comprehensive guide to Brava's communities with your
            photos and experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contribute"
              className="rounded-md bg-valley-green px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-valley-green/90"
            >
              Contribute Content
            </Link>
            <Link
              href="/directory/all"
              className="rounded-md border-2 border-valley-green px-6 py-3 text-base font-semibold text-valley-green transition-colors hover:bg-valley-green hover:text-white"
            >
              Browse Directory
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata() {
  return {
    title: "Towns & Villages of Brava Island | Nos Ilha",
    description:
      "Discover Brava Island's authentic settlements: UNESCO-listed Nova Sintra, volcanic crater harbor Furna, natural pools of Fajã de Água, and historic pilgrimage sites.",
    openGraph: {
      title: "Towns & Villages - Brava Island",
      description:
        "Explore authentic Cape Verdean communities from UNESCO heritage sites to volcanic crater harbors, shaped by morna music traditions and maritime heritage.",
      images: ["/images/towns/brava-towns-overview.jpg"],
    },
  };
}
