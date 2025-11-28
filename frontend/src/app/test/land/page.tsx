/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
"use client";
import React, { useState } from "react";
import {
  MapPin,
  Search,
  BookOpen,
  Users,
  ArrowRight,
  Camera,
  Music,
  Anchor,
  Compass,
  type LucideIcon,
} from "lucide-react";

// --- Types & Interfaces ---

interface FeaturedItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  link: string;
}

// --- Sub-Components ---

/**
 * SectionHeader: Reusable header for landing page sections
 */
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

/**
 * CategoryCard: Navigation cards for main directory areas
 */
const CategoryCard = ({
  icon: Icon,
  title,
  description,
  colorClass,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  colorClass: string;
}) => (
  <a
    href="#"
    className="group border-border-secondary hover:border-ocean-blue/30 relative block overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md"
  >
    <div
      className={`absolute top-0 right-0 -mt-8 -mr-8 h-24 w-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${colorClass}`}
    />
    <div
      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${colorClass} text-white`}
    >
      <Icon size={24} />
    </div>
    <h3 className="text-text-primary group-hover:text-ocean-blue mb-2 font-serif text-xl font-bold transition-colors">
      {title}
    </h3>
    <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
    <div className="text-ocean-blue mt-4 flex -translate-x-4 items-center text-sm font-semibold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
      Explore <ArrowRight size={16} className="ml-1" />
    </div>
  </a>
);

/**
 * FeaturedStoryCard: For highlighting specific heritage items
 */
const FeaturedStoryCard = ({ item }: { item: FeaturedItem }) => (
  <div className="group relative h-96 cursor-pointer overflow-hidden rounded-2xl shadow-lg">
    {/* Image Background */}
    <div className="absolute inset-0 bg-gray-200">
      <img
        src={item.image}
        alt={item.title}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        onError={(e) => {
          // Fallback for demo purposes if images fail
          (e.target as HTMLImageElement).src =
            `https://placehold.co/600x800/005a85/ffffff?text=${encodeURIComponent(item.title)}`;
        }}
      />
    </div>

    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90 transition-opacity duration-300" />

    {/* Content */}
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
      <div className="flex w-max items-center border-b border-white/30 pb-1 text-sm font-bold transition-colors hover:border-white">
        Read Story <ArrowRight size={16} className="ml-2" />
      </div>
    </div>
  </div>
);

// --- Main Page Component ---

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Router push to /directory?q=...
  };

  // Mock data - replace with getFeaturedEntries() from your API
  const featuredStories: FeaturedItem[] = [
    {
      id: "1",
      title: "Eugénio Tavares",
      category: "Historical Figure",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/6/6f/Eug%C3%A9nio_Tavares.jpg",
      description:
        "Explore the life of the poet who immortalized the soul of Brava through Morna.",
      link: "/people/eugenio-tavares",
    },
    {
      id: "2",
      title: "Fajã d'Agua",
      category: "Towns & Bays",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Faj%C3%A3_de_%C3%81gua_02.jpg/1280px-Faj%C3%A3_de_%C3%81gua_02.jpg",
      description:
        "A stunning natural bay known for its crystal clear pools and lush mango trees.",
      link: "/towns/faja-dagua",
    },
    {
      id: "3",
      title: "Fontainhas",
      category: "Landmarks",
      image:
        "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=800",
      description:
        "Discover the architectural beauty of Nova Sintra's historic gardens.",
      link: "/towns/nova-sintra",
    },
  ];

  return (
    <div className="bg-off-white selection:bg-ocean-blue min-h-screen font-sans selection:text-white">
      {/* 1. HERO SECTION 
          Goal: Emotional connection + Immediate Utility 
      */}
      <section className="relative flex h-[85vh] min-h-[600px] items-center justify-center overflow-hidden">
        {/* Background Image with Parallax-like effect */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542345754-52d373e21c32?q=80&w=2000&auto=format&fit=crop"
            alt="Brava Island Coastline"
            className="animate-pulse-subtle h-full w-full scale-105 object-cover"
          />
          {/* Brand Overlay: Ocean Blue to Transparent */}
          <div className="from-ocean-blue/90 via-ocean-blue/50 absolute inset-0 bg-gradient-to-r to-transparent" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-4 md:px-6">
          <div className="animate-slide-up max-w-3xl">
            <div className="text-sunny-yellow mb-4 flex items-center space-x-2 font-bold tracking-widest uppercase">
              <span className="bg-sunny-yellow h-[2px] w-8"></span>
              <span>Ilha das Flores</span>
            </div>

            <h1 className="mb-6 font-serif text-5xl leading-tight font-bold text-white drop-shadow-lg md:text-7xl">
              Discover the <br />
              <span className="from-sunny-yellow bg-gradient-to-r to-white bg-clip-text text-transparent">
                Soul of Brava
              </span>
            </h1>

            <p className="mb-8 max-w-xl text-lg leading-relaxed text-white/90 drop-shadow-md md:text-xl">
              The definitive cultural heritage hub connecting the global
              diaspora to the history, people, and hidden gems of Brava Island.
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="group relative mb-8 max-w-lg"
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="group-focus-within:text-ocean-blue h-5 w-5 text-gray-400 transition-colors" />
              </div>
              <input
                type="text"
                className="focus:ring-sunny-yellow block w-full rounded-full border-none bg-white/95 py-4 pr-4 pl-12 text-base text-gray-900 placeholder-gray-500 shadow-2xl backdrop-blur-sm transition-all focus:bg-white focus:ring-2"
                placeholder="Search history, towns, or businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="bg-ocean-blue hover:bg-bougainvillea-pink absolute inset-y-1 right-1 rounded-full px-6 text-sm font-bold text-white shadow-md transition-colors"
              >
                Search
              </button>
            </form>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-4 text-sm font-semibold text-white/80">
              <span>Trending:</span>
              <a
                href="#"
                className="hover:text-sunny-yellow decoration-sunny-yellow/50 hover:decoration-sunny-yellow underline transition-all"
              >
                Eugénio Tavares
              </a>
              <a
                href="#"
                className="hover:text-sunny-yellow decoration-sunny-yellow/50 hover:decoration-sunny-yellow underline transition-all"
              >
                Fajã d'Agua
              </a>
              <a
                href="#"
                className="hover:text-sunny-yellow decoration-sunny-yellow/50 hover:decoration-sunny-yellow underline transition-all"
              >
                Hotels
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. NAVIGATION GRID (Bento Box Style)
          Goal: Direct traffic to core pillars 
      */}
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
              description="Detailed guides to Nova Sintra, Furna, Nossa Senhora do Monte, and more."
              colorClass="bg-ocean-blue"
            />
            <CategoryCard
              icon={BookOpen}
              title="History & Archive"
              description="Digital archives of historical documents, genealogies, and timelines."
              colorClass="bg-bougainvillea-pink"
            />
            <CategoryCard
              icon={Compass}
              title="Tourism Directory"
              description="Curated listings of local hotels, restaurants, and guides."
              colorClass="bg-valley-green"
            />
            <CategoryCard
              icon={Music}
              title="Culture & Arts"
              description="The home of Morna, festivals, and local artisans."
              colorClass="bg-sunny-yellow"
            />
          </div>
        </div>
      </section>

      {/* 3. FEATURED CONTENT
          Goal: Showcase dynamic content and keep page fresh 
      */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-text-primary mb-2 font-serif text-3xl font-bold md:text-4xl">
                Featured Stories
              </h2>
              <p className="text-text-secondary">
                Highlights from the archive and community.
              </p>
            </div>
            <a
              href="/history"
              className="text-ocean-blue hover:text-bougainvillea-pink hidden items-center font-bold transition-colors md:flex"
            >
              View All Archive <ArrowRight size={20} className="ml-2" />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {featuredStories.map((item) => (
              <FeaturedStoryCard key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <a
              href="/history"
              className="border-ocean-blue text-ocean-blue hover:bg-ocean-blue inline-flex items-center rounded-full border px-6 py-3 font-bold transition-colors hover:text-white"
            >
              View All Archive <ArrowRight size={20} className="ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE MAP TEASER
          Goal: Promote the spatial discovery feature 
      */}
      <section className="bg-background-tertiary relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 container mx-auto px-4 md:px-6">
          <div className="border-border-secondary flex flex-col items-center gap-12 rounded-3xl border bg-white p-8 shadow-xl md:p-12 lg:flex-row">
            {/* Text Content */}
            <div className="lg:w-1/2">
              <div className="text-ocean-blue mb-4 flex items-center space-x-2 font-bold tracking-widest uppercase">
                <MapPin className="h-5 w-5" />
                <span>Interactive Map</span>
              </div>
              <h2 className="text-text-primary mb-6 font-serif text-3xl font-bold md:text-4xl">
                Navigate the History of Brava
              </h2>
              <p className="text-text-secondary mb-8 text-lg leading-relaxed">
                Experience the island like never before. Our interactive
                heritage map layers historical photos, oral histories, and
                cultural landmarks directly onto the landscape.
              </p>

              <ul className="mb-8 space-y-4">
                {[
                  "Locate historical buildings in Nova Sintra",
                  "Trace hiking trails with GPS support",
                  "Find local businesses near you",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="text-volcanic-gray-dark flex items-center"
                  >
                    <div className="bg-valley-green mr-3 h-2 w-2 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href="/map"
                className="bg-ocean-blue hover:bg-ocean-blue/90 inline-flex items-center rounded-lg px-8 py-4 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                Open Interactive Map
              </a>
            </div>

            {/* Visual/Map Placeholder */}
            <div className="w-full lg:w-1/2">
              <div className="group relative aspect-square overflow-hidden rounded-2xl border-4 border-white bg-blue-50 shadow-inner md:aspect-video">
                {/* Simulated Map UI */}
                <div className="absolute inset-0 bg-[url('https://www.openstreetmap.org/assets/osm_logo-5e45c775073289047970d4f20427847c0b028448b1116c4f9712760634129524.svg')] bg-center bg-no-repeat opacity-10" />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Brava_OpenStreetMap.png/600px-Brava_OpenStreetMap.png"
                  alt="Map of Brava"
                  className="h-full w-full object-cover mix-blend-multiply"
                />

                {/* Floating Markers */}
                <div className="animate-bounce-reaction absolute top-1/3 left-1/2 flex items-center gap-2 rounded-lg bg-white p-2 shadow-lg">
                  <div className="bg-bougainvillea-pink rounded-md p-1.5 text-white">
                    <Camera size={14} />
                  </div>
                  <div className="pr-1 text-xs font-bold text-gray-800">
                    Fajã d'Agua
                  </div>
                </div>

                <div className="absolute right-1/3 bottom-1/3 flex animate-pulse items-center gap-2 rounded-lg bg-white p-2 shadow-lg">
                  <div className="bg-ocean-blue rounded-md p-1.5 text-white">
                    <Anchor size={14} />
                  </div>
                  <div className="pr-1 text-xs font-bold text-gray-800">
                    Furna Port
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. IMPACT / STATS 
          Goal: Show project maturity and community involvement 
      */}
      <section className="bg-ocean-blue py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 divide-y divide-white/20 md:grid-cols-4 md:divide-x md:divide-y-0">
            <div className="p-4 text-center">
              <div className="text-sunny-yellow mb-2 font-serif text-4xl font-bold">
                20+
              </div>
              <div className="text-sm tracking-wider text-white/80 uppercase">
                Towns & Localities
              </div>
            </div>
            <div className="p-4 text-center">
              <div className="text-sunny-yellow mb-2 font-serif text-4xl font-bold">
                150+
              </div>
              <div className="text-sm tracking-wider text-white/80 uppercase">
                Heritage Sites
              </div>
            </div>
            <div className="p-4 text-center">
              <div className="text-sunny-yellow mb-2 font-serif text-4xl font-bold">
                500+
              </div>
              <div className="text-sm tracking-wider text-white/80 uppercase">
                Archive Photos
              </div>
            </div>
            <div className="p-4 text-center">
              <div className="text-sunny-yellow mb-2 font-serif text-4xl font-bold">
                100%
              </div>
              <div className="text-sm tracking-wider text-white/80 uppercase">
                Community Driven
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. NEWSLETTER / CTA
          Goal: Capture user emails for re-engagement
      */}
      <section className="relative overflow-hidden bg-white py-24">
        {/* Decorative background circle */}
        <div className="bg-sunny-yellow/10 absolute -top-20 -right-20 h-96 w-96 rounded-full blur-3xl"></div>
        <div className="bg-ocean-blue/5 absolute bottom-0 -left-20 h-72 w-72 rounded-full blur-3xl"></div>

        <div className="relative z-10 container mx-auto max-w-3xl px-4 text-center">
          <div className="text-ocean-blue mb-6 inline-block rounded-full bg-blue-50 p-3">
            <Users size={32} />
          </div>
          <h2 className="text-text-primary mb-6 font-serif text-4xl font-bold md:text-5xl">
            Join the Brava Community
          </h2>
          <p className="text-text-secondary mb-10 text-lg leading-relaxed">
            Whether you are a local, part of the diaspora, or a visitor, stay
            connected with the latest stories, events, and updates from Nos
            Ilha.
          </p>

          <form className="mx-auto flex max-w-lg flex-col gap-4 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email address"
              className="focus:ring-ocean-blue flex-grow rounded-lg border border-gray-200 bg-gray-50 px-6 py-4 transition-all focus:border-transparent focus:ring-2 focus:outline-none"
            />
            <button className="bg-ocean-blue hover:bg-bougainvillea-pink rounded-lg px-8 py-4 font-bold text-white shadow-lg transition-colors">
              Subscribe
            </button>
          </form>
          <p className="mt-4 text-xs text-gray-400">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
}
