import Link from "next/link";
import Image from "next/image";
import { getEntriesByCategory } from "@/lib/api";
import { DirectoryCard } from "@/components/ui/directory-card";
import { PageHeader } from "@/components/ui/page-header";
import {
  MapIcon,
  ListBulletIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

// Data for the new "Island Guide" (features) section
const nosilhaFeatures = [
  {
    name: "Interactive Map",
    description:
      "Navigate with ease. Our detailed map shows every point of interest, from restaurants and hotels to hidden trails and scenic viewpoints.",
    href: "/map",
    icon: MapIcon,
  },
  {
    name: "Complete Directory",
    description:
      "Discover the best of Brava. Browse a comprehensive, up-to-date directory of businesses, landmarks, and cultural sites.",
    href: "/directory/all",
    icon: ListBulletIcon,
  },
  {
    name: "Rich History & Culture",
    description:
      "Dive into the stories, figures, and traditions that make Brava unique. Explore historical articles, photo galleries, and more.",
    href: "/history",
    icon: BookOpenIcon,
  },
];

// Force dynamic rendering for real-time featured content
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredEntries = await getEntriesByCategory("all");

  return (
    <>
      {/* Hero Section */}
      <section className="relative flex h-[calc(100vh-81px)] items-center justify-center text-center text-white">
        {/* ... existing hero section code ... */}
        <Image
          src="/images/hero.jpg"
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

      {/* Featured Highlights Section */}
      <section className="bg-background-primary py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <PageHeader
            title="Featured Highlights"
            subtitle="Get a glimpse of the unique places and experiences Brava has to offer."
          />
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-4 md:grid-cols-2">
            {featuredEntries.slice(0, 4).map((entry) => (
              <DirectoryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      </section>

      {/* Newly Added Section: Island Guide */}
      <div className="bg-background-secondary py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-ocean-blue dark:text-ocean-blue">
              An Island of Treasures
            </h2>
            <p className="mt-2 font-serif text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              Your Comprehensive Guide to Brava
            </p>
            <p className="mt-6 text-lg leading-8 text-text-secondary">
              Our platform is designed to help you explore every facet of the
              island, from its stunning geography to its rich cultural tapestry.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
              {nosilhaFeatures.map((feature) => (
                <Link
                  key={feature.name}
                  href={feature.href}
                  className="group relative block pl-16 rounded-lg p-4 transition-all duration-300 hover:bg-background-primary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ocean-blue focus:ring-offset-2"
                >
                  <dt className="text-base font-semibold leading-7 text-text-primary group-hover:text-ocean-blue transition-colors duration-300">
                    <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg bg-ocean-blue group-hover:bg-ocean-blue/90 transition-colors duration-300">
                      <feature.icon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-text-secondary group-hover:text-text-primary transition-colors duration-300">
                    {feature.description}
                  </dd>
                </Link>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
