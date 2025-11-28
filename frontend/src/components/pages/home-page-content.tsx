import Image from "next/image";
import Link from "next/link";
import { DirectoryCard } from "@/components/ui/directory-card";
import HomepageNewsletterSection from "@/components/newsletter/homepage-newsletter-section";
import { PageHeader } from "@/components/ui/page-header";
import { SocialMediaLinks } from "@/components/ui/social-media-links";
import type { DirectoryEntry } from "@/types/directory";
import {
  Map,
  List,
  BookOpen,
  Users,
  // Camera,
  // Building,
} from "lucide-react";

const nosilhaFeatures = [
  {
    name: "Interactive Map",
    description:
      "Navigate with ease. Our detailed map shows every point of interest, from restaurants and hotels to hidden trails and scenic viewpoints.",
    href: "/map",
    icon: Map,
  },
  {
    name: "Complete Directory",
    description:
      "Discover the best of Brava. Browse a comprehensive, up-to-date directory of businesses, landmarks, and cultural sites.",
    href: "/directory/all",
    icon: List,
  },
  {
    name: "Rich History & Culture",
    description:
      "Dive into the stories, figures, and traditions that make Brava unique. Explore historical articles and more.",
    href: "/history",
    icon: BookOpen,
  },
];

const popularPages = [
  /*
  {
    name: "Towns & Villages",
    description:
      "Explore the charming settlements and communities across Brava",
    href: "/towns",
    icon: BuildingOfficeIcon,
    category: "Explore",
  },
  */
  {
    name: "History of Brava",
    description:
      "Discover the fascinating stories and events that shaped this remarkable island",
    href: "/history",
    icon: BookOpen,
    category: "Culture",
  },
  /*
  {
    name: "Photo Galleries",
    description:
      "Browse stunning visual stories of Brava's landscapes and culture",
    href: "/media/photos",
    icon: Camera,
    category: "Culture",
  },
  */
  {
    name: "Historical Figures",
    description: "Meet the remarkable people who shaped Brava's rich heritage",
    href: "/people",
    icon: Users,
    category: "Culture",
  },
].filter(Boolean);

export interface HomePageContentProps {
  featuredEntries: DirectoryEntry[];
}

export function HomePageContent({ featuredEntries }: HomePageContentProps) {
  return (
    <>
      <section className="relative flex h-[calc(100vh-81px)] items-center justify-center text-center text-white">
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
            Your journey into the heart of Cape Verde's most enchanting hidden
            gem begins here.
          </p>
          <div className="mt-10">
            <Link
              href="/map"
              className="bg-ocean-blue hover:bg-ocean-blue/90 focus-visible:outline-ocean-blue rounded-md px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Explore the Interactive Map
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-background-primary py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <PageHeader
            title="Featured Highlights"
            subtitle="Get a glimpse of the unique places and experiences Brava has to offer."
            as="h2"
          />
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4">
            {featuredEntries.slice(0, 4).map((entry) => (
              <DirectoryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      </section>

      <div className="bg-background-secondary py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-ocean-blue text-base leading-7 font-semibold">
              An Island of Treasures
            </h2>
            <p className="text-text-primary mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Your Comprehensive Guide to Brava
            </p>
            <p className="text-text-secondary mt-6 text-lg leading-8">
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
                  className="group hover:bg-background-primary focus:ring-ocean-blue relative block rounded-lg p-4 pl-16 transition-all duration-300 hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  <dt className="text-text-primary group-hover:text-ocean-blue text-base leading-7 font-semibold transition-colors duration-300">
                    <div className="bg-ocean-blue group-hover:bg-ocean-blue/90 absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-300">
                      <feature.icon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="text-text-secondary group-hover:text-text-primary mt-2 text-base leading-7 transition-colors duration-300">
                    {feature.description}
                  </dd>
                </Link>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <section className="bg-background-primary py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-ocean-blue text-base leading-7 font-semibold">
              Discover More
            </h2>
            <p className="text-text-primary mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Popular Destinations & Stories
            </p>
            <p className="text-text-secondary mt-6 text-lg leading-8">
              Don't miss these essential pages that showcase the depth and
              beauty of Brava's culture and communities.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            {popularPages.map((page) => (
              <Link
                key={page.name}
                href={page.href}
                className="group hover:bg-background-secondary border-border-primary hover:border-ocean-blue/30 relative flex gap-x-6 rounded-lg border p-6 text-sm leading-6 transition-all duration-300 hover:shadow-md"
              >
                <div className="bg-ocean-blue/10 group-hover:bg-ocean-blue/20 flex h-12 w-12 flex-none items-center justify-center rounded-lg transition-colors duration-300">
                  <page.icon
                    className="text-ocean-blue group-hover:text-ocean-blue/90 h-6 w-6"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-auto">
                  <div className="flex items-center gap-x-2">
                    <span className="text-ocean-blue bg-ocean-blue/10 rounded-md px-2 py-1 text-xs font-medium">
                      {page.category}
                    </span>
                  </div>
                  <div className="text-text-primary group-hover:text-ocean-blue mt-2 font-semibold transition-colors duration-300">
                    {page.name}
                  </div>
                  <p className="text-text-secondary group-hover:text-text-primary mt-1 transition-colors duration-300">
                    {page.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HomepageNewsletterSection />

      <SocialMediaLinks />
    </>
  );
}
