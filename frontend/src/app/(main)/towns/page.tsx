import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/ui/page-header";
import { getTowns } from "@/lib/api";
import { MapPin, Users, Camera } from "lucide-react";

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
        <section className="bg-background-primary border-border-primary mt-16 rounded-lg border p-8 shadow-sm">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-text-primary mb-4 font-serif text-3xl font-bold">
                Island Communities
              </h2>
              <p className="text-text-secondary mb-4 text-lg">
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
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </section>

        {/* Featured Towns */}
        <section className="mt-16">
          <h3 className="text-text-primary mb-8 font-serif text-2xl font-bold">
            Our Main Communities
          </h3>

          <div className="grid gap-8 md:grid-cols-2">
            {featuredTowns.map((town) => (
              <div
                key={town.slug}
                className="bg-background-primary border-border-primary overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md"
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
                  <h4 className="text-text-primary mb-2 font-serif text-xl font-bold">
                    {town.name}
                  </h4>
                  <p className="text-text-secondary mb-4">{town.description}</p>

                  <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="text-text-secondary flex items-center">
                      <Users className="text-ocean-blue mr-2 h-4 w-4" />
                      {town.population || "Population unknown"}
                    </div>
                    <div className="text-text-secondary flex items-center">
                      <MapPin className="text-ocean-blue mr-2 h-4 w-4" />
                      {town.elevation || "Elevation unknown"}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-text-primary mb-2 text-sm font-medium">
                      Highlights:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {town.highlights.map((highlight, index) => (
                        <span
                          key={index}
                          className="bg-ocean-blue/10 text-ocean-blue rounded px-2 py-1 text-xs"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/towns/${town.slug}`}
                    className="text-ocean-blue hover:text-ocean-blue/80 inline-flex items-center font-medium"
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
          <h3 className="text-text-primary mb-8 font-serif text-2xl font-bold">
            Hidden Gems
          </h3>

          <div className="grid gap-6 md:grid-cols-2">
            {otherTowns.map((town) => (
              <div
                key={town.slug}
                className="bg-background-primary border-border-primary rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start space-x-4">
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <Image
                      src={town.heroImage || "/images/towns/default-town.jpg"}
                      alt={`View of ${town.name}`}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-text-primary mb-1 text-lg font-semibold">
                      {town.name}
                    </h4>
                    <p className="text-text-secondary mb-2 text-sm">
                      {town.description}
                    </p>
                    <div className="text-text-secondary mb-2 flex items-center space-x-4 text-xs">
                      <span className="flex items-center">
                        <Users className="mr-1 h-3 w-3" />
                        {town.population || "Population unknown"}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {town.elevation || "Elevation unknown"}
                      </span>
                    </div>
                    <Link
                      href={`/towns/${town.slug}`}
                      className="text-ocean-blue hover:text-ocean-blue/80 text-sm font-medium"
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
        <section className="from-ocean-blue/10 to-valley-green/10 mt-16 rounded-lg bg-gradient-to-r p-8 text-center">
          <MapPin className="text-ocean-blue mx-auto mb-4 h-12 w-12" />
          <h3 className="text-text-primary mb-4 font-serif text-2xl font-bold">
            Explore on the Interactive Map
          </h3>
          <p className="text-text-secondary mb-6 text-lg">
            See the locations of all towns and discover points of interest in
            each community.
          </p>
          <Link
            href="/map"
            className="bg-ocean-blue hover:bg-ocean-blue/90 rounded-md px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105"
          >
            View Map
          </Link>
        </section>

        {/* Contribute Section */}
        <section className="mt-16 text-center">
          <Camera className="text-valley-green mx-auto mb-4 h-12 w-12" />
          <h3 className="text-text-primary mb-4 font-serif text-2xl font-bold">
            Share Your Town Stories
          </h3>
          <p className="text-text-secondary mb-6 text-lg">
            Help us build a comprehensive guide to Brava's communities with your
            photos and experiences.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/contribute"
              className="bg-valley-green hover:bg-valley-green/90 rounded-md px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105"
            >
              Contribute Content
            </Link>
            <Link
              href="/directory/all"
              className="border-valley-green text-valley-green hover:bg-valley-green rounded-md border-2 px-6 py-3 text-base font-semibold transition-colors hover:text-white"
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
