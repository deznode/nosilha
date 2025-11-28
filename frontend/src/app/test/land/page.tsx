"use client";

import React, { useState } from "react";
// import Link from 'next/link'; // Uncomment for Next.js
import {
  MapPin,
  Search,
  BookOpen,
  Users,
  ArrowRight,
  Music,
  Compass,
  Trophy, // Added Trophy icon for the World Cup news
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

// --- Temporary Link Component (Delete in real app) ---
const Link = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
};

// ... (Keep existing Types & Interfaces) ...
interface FeaturedItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  link: string;
}

// ... (Keep existing Sub-Components like SectionHeader, CategoryCard, etc.) ...
const SectionHeader = ({
  title,
  subtitle,
  centered = false,
}: {
  title: string;
  subtitle?: string;
  centered?: boolean;
}) => (
  <div className={`mb-12 ${centered ? "text-center" : "text-left"}`}>
    <h2 className="text-ocean-blue mb-4 font-serif text-3xl font-bold md:text-4xl">
      {title}
    </h2>
    {subtitle && (
      <p className="text-volcanic-gray mx-auto max-w-2xl font-sans text-lg leading-relaxed">
        {subtitle}
      </p>
    )}
    <div
      className={`bg-bougainvillea-pink mt-4 h-1 w-24 rounded-full ${centered ? "mx-auto" : ""}`}
    />
  </div>
);

const CategoryCard = ({
  icon: Icon,
  title,
  description,
  colorClass,
  href,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  colorClass: string;
  href: string;
}) => (
  <Link
    href={href}
    className="group border-border-secondary hover:border-ocean-blue/30 relative block h-full overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
  >
    <div
      className={`absolute top-0 right-0 -mt-8 -mr-8 h-24 w-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${colorClass}`}
    />
    <div
      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${colorClass} text-white shadow-md`}
    >
      <Icon size={24} />
    </div>
    <h3 className="text-text-primary group-hover:text-ocean-blue mb-2 font-serif text-xl font-bold transition-colors">
      {title}
    </h3>
    <p className="text-text-secondary mb-8 text-sm leading-relaxed">
      {description}
    </p>
    <div className="text-ocean-blue absolute bottom-6 left-6 flex -translate-x-4 items-center text-sm font-bold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
      Explore Section <ArrowRight size={16} className="ml-1" />
    </div>
  </Link>
);

const FeaturedStoryCard = ({ item }: { item: FeaturedItem }) => (
  <Link
    href={item.link}
    className="group relative block h-96 cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-shadow duration-300 hover:shadow-2xl"
  >
    <div className="absolute inset-0 bg-gray-200">
      <Image
        src={item.image}
        alt={item.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        unoptimized
      />
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
    <div className="absolute bottom-0 left-0 w-full translate-y-2 transform p-6 text-white transition-transform duration-300 group-hover:translate-y-0 md:p-8">
      <span className="bg-bougainvillea-pink mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase shadow-md">
        {item.category}
      </span>
      <h3 className="mb-2 font-serif text-2xl leading-tight font-bold">
        {item.title}
      </h3>
      <p className="mb-4 line-clamp-2 text-sm text-gray-200 opacity-0 transition-opacity delay-100 duration-500 group-hover:opacity-100">
        {item.description}
      </p>
      <div className="text-sunny-yellow flex w-max items-center border-b border-white/30 pb-1 text-sm font-bold transition-colors hover:border-white">
        Read Story <ArrowRight size={16} className="ml-2" />
      </div>
    </div>
  </Link>
);

// --- Main Page Component ---

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  // Mock data (Keep existing)
  const featuredStories: FeaturedItem[] = [
    {
      id: "1",
      title: "Eugénio Tavares",
      category: "Historical Figure",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/6/6f/Eug%C3%A9nio_Tavares.jpg",
      description:
        "Explore the life of the poet who immortalized the soul of Brava.",
      link: "/people/eugenio-tavares",
    },
    {
      id: "2",
      title: "Fajã d'Agua",
      category: "Towns & Bays",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Faj%C3%A3_de_%C3%81gua_02.jpg/1280px-Faj%C3%A3_de_%C3%81gua_02.jpg",
      description: "A stunning natural bay known for its crystal clear pools.",
      link: "/towns/faja-dagua",
    },
    {
      id: "3",
      title: "Fontainhas",
      category: "Landmarks",
      image:
        "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=800",
      description: "Discover the architectural beauty of Nova Sintra.",
      link: "/towns/nova-sintra",
    },
  ];

  return (
    <div className="bg-off-white selection:bg-ocean-blue min-h-screen font-sans selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative flex h-[85vh] min-h-[600px] items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1542345754-52d373e21c32?q=80&w=2000&auto=format&fit=crop"
            alt="Brava Island Coastline"
            fill
            className="animate-pulse-subtle scale-105 object-cover"
            unoptimized
          />
          <div className="from-ocean-blue/95 via-ocean-blue/60 absolute inset-0 bg-gradient-to-r to-transparent" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-4 md:px-6">
          <div className="animate-slide-up max-w-4xl">
            {/* ✨ NEW: Announcement Pill (Replaces the top banner) */}
            <Link
              href="/news/world-cup"
              className="group mb-8 inline-flex cursor-pointer items-center gap-3 rounded-full border border-white/20 bg-white/10 px-1 py-1 pr-4 text-white backdrop-blur-md transition-all hover:bg-white/20"
            >
              <span className="bg-bougainvillea-pink flex items-center justify-center rounded-full px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-sm">
                <Trophy size={12} className="mr-1" /> News
              </span>
              <span className="text-xs font-medium opacity-90 group-hover:opacity-100 md:text-sm">
                Tubarões Azuis: Mundial 2026! Read the full story
              </span>
              <ArrowRight
                size={14}
                className="opacity-70 transition-transform group-hover:translate-x-1"
              />
            </Link>

            {/* Subtitle Line */}
            <div className="text-sunny-yellow mb-6 flex items-center space-x-3 font-bold tracking-widest uppercase">
              <span className="bg-sunny-yellow h-[3px] w-12 rounded-full"></span>
              <span className="text-sm md:text-base">
                Ilha das Flores • Cape Verde
              </span>
            </div>

            <h1 className="mb-6 font-serif text-5xl leading-tight font-bold text-white drop-shadow-lg md:text-7xl">
              Discover the <br />
              <span className="from-sunny-yellow bg-gradient-to-r to-white bg-clip-text text-transparent">
                Soul of Brava
              </span>
            </h1>

            <p className="mb-10 max-w-xl text-lg leading-relaxed text-white/90 drop-shadow-md md:text-xl">
              The definitive cultural heritage hub connecting the global
              diaspora to the history, people, and hidden gems of Brava Island.
            </p>

            {/* Search Bar - Glassmorphism */}
            <form
              onSubmit={handleSearch}
              className="group relative mb-10 max-w-xl"
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                <Search className="group-focus-within:text-ocean-blue h-5 w-5 text-gray-400 transition-colors" />
              </div>
              <input
                type="text"
                className="focus:ring-ocean-blue/30 focus:border-ocean-blue block w-full rounded-full border border-white/20 bg-white/95 py-5 pr-32 pl-14 text-base text-gray-900 placeholder-gray-500 shadow-2xl backdrop-blur-md transition-all outline-none focus:ring-4"
                placeholder="Search history, towns, or businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="bg-ocean-blue hover:bg-bougainvillea-pink absolute inset-y-1.5 right-1.5 flex items-center rounded-full px-8 text-sm font-bold text-white shadow-md transition-colors"
              >
                Search
              </button>
            </form>

            {/* Quick Access Chips */}
            <div className="flex flex-col items-start gap-4 text-sm text-white/90 md:flex-row md:items-center">
              <span className="text-xs font-semibold tracking-wide uppercase opacity-70">
                Quick Access:
              </span>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/people/eugenio-tavares"
                  className="hover:border-sunny-yellow rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  📖 Eugénio Tavares
                </Link>
                <Link
                  href="/towns/faja-dagua"
                  className="hover:border-sunny-yellow rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  🌊 Fajã d'Agua
                </Link>
                <Link
                  href="/directory/hotels"
                  className="hover:border-sunny-yellow rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  🏨 Hotels
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. NAVIGATION GRID */}
      <section className="bg-background-secondary relative z-20 -mt-20 rounded-t-[3rem] py-20">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeader
            title="Explore Our Heritage"
            subtitle="Dive into the rich tapestry of Brava's culture, from the mist-covered peaks of Nova Sintra to the historic shores of Furna."
            centered
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <CategoryCard
              icon={MapPin}
              title="Towns & Villages"
              description="Detailed guides to Nova Sintra, Furna, and more."
              colorClass="bg-ocean-blue"
              href="/towns"
            />
            <CategoryCard
              icon={BookOpen}
              title="History & Archive"
              description="Digital archives of historical documents."
              colorClass="bg-bougainvillea-pink"
              href="/history"
            />
            <CategoryCard
              icon={Compass}
              title="Tourism Directory"
              description="Curated listings of local hotels and guides."
              colorClass="bg-valley-green"
              href="/directory"
            />
            <CategoryCard
              icon={Music}
              title="Culture & Arts"
              description="The home of Morna, festivals, and artisans."
              colorClass="bg-sunny-yellow"
              href="/culture"
            />
          </div>
        </div>
      </section>

      {/* 3. FEATURED CONTENT */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 flex flex-col items-end justify-between gap-4 md:flex-row">
            <div>
              <h2 className="text-text-primary mb-2 font-serif text-3xl font-bold md:text-4xl">
                Featured Stories
              </h2>
              <p className="text-text-secondary">
                Highlights from the archive and community.
              </p>
            </div>
            <Link
              href="/history"
              className="group text-ocean-blue hover:text-bougainvillea-pink flex items-center font-bold transition-colors"
            >
              View All Archive{" "}
              <ArrowRight
                size={20}
                className="ml-2 transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {featuredStories.map((item) => (
              <FeaturedStoryCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. NEWSLETTER / CTA */}
      <section className="bg-ocean-blue relative overflow-hidden py-24 text-white">
        <div className="relative z-10 container mx-auto max-w-3xl px-4 text-center">
          <div className="text-sunny-yellow mb-6 inline-block rounded-full bg-white/10 p-4 backdrop-blur-md">
            <Users size={32} />
          </div>
          <h2 className="mb-6 font-serif text-4xl font-bold md:text-5xl">
            Join the Brava Community
          </h2>
          <p className="mb-10 text-lg leading-relaxed text-white/80">
            Join our community of storytellers. Stay connected with updates or
            find out how you can contribute photos and stories to the archive.
          </p>
          <form className="mx-auto flex max-w-lg flex-col gap-4 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email address"
              className="focus:ring-sunny-yellow flex-grow rounded-lg border border-white/20 bg-white/10 px-6 py-4 text-white placeholder-white/60 backdrop-blur-sm transition-all focus:bg-white/20 focus:ring-2 focus:outline-none"
            />
            <button className="bg-sunny-yellow text-ocean-blue hover:text-ocean-blue rounded-lg px-8 py-4 font-bold shadow-lg transition-colors hover:bg-white">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
