/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";
// import Link from "next/link"; // Uncomment this line in your Next.js project
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
  Quote,
  type LucideIcon,
} from "lucide-react";

// --- Temporary Link Component for Preview ---
// (In your actual Next.js app, delete this component and use the import above)
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

// --- Types & Interfaces ---

interface FeaturedItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  link: string;
}

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatar: string;
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

/**
 * FeaturedStoryCard: For highlighting specific heritage items
 */
const FeaturedStoryCard = ({ item }: { item: FeaturedItem }) => (
  <Link
    href={item.link}
    className="group relative block h-96 cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-shadow duration-300 hover:shadow-2xl"
  >
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
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

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
      <div className="text-sunny-yellow flex w-max items-center border-b border-white/30 pb-1 text-sm font-bold transition-colors hover:border-white">
        Read Story <ArrowRight size={16} className="ml-2" />
      </div>
    </div>
  </Link>
);

/**
 * TestimonialCard: Social proof
 */
const TestimonialCard = ({ item }: { item: Testimonial }) => (
  <div className="border-border-secondary relative rounded-2xl border bg-white p-6 shadow-sm">
    <Quote className="text-ocean-blue/10 absolute top-6 right-6 h-10 w-10" />
    <div className="mb-4 flex items-center space-x-4">
      <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
        <img
          src={item.avatar}
          alt={item.author}
          className="h-full w-full object-cover"
        />
      </div>
      <div>
        <div className="text-text-primary font-bold">{item.author}</div>
        <div className="text-ocean-blue text-xs font-semibold tracking-wider uppercase">
          {item.role}
        </div>
      </div>
    </div>
    <p className="text-volcanic-gray text-sm leading-relaxed italic">
      "{item.quote}"
    </p>
  </div>
);

// --- Main Page Component ---

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // In a real app: router.push(`/directory?q=${searchQuery}`);
  };

  // Mock data
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

  const testimonials: Testimonial[] = [
    {
      id: "t1",
      quote:
        "Nos Ilha helped me find the exact house my grandfather grew up in. It's more than a website; it's a bridge to our past.",
      author: "Maria Andrade",
      role: "Diaspora Member (USA)",
      avatar: "https://i.pravatar.cc/150?u=maria",
    },
    {
      id: "t2",
      quote:
        "As a local business owner, this platform has put my small guest house on the map for international visitors.",
      author: "Joao Baptista",
      role: "Local Entrepreneur",
      avatar: "https://i.pravatar.cc/150?u=joao",
    },
  ];

  return (
    <div className="bg-off-white selection:bg-ocean-blue min-h-screen font-sans selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative flex h-[85vh] min-h-[600px] items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542345754-52d373e21c32?q=80&w=2000&auto=format&fit=crop"
            alt="Brava Island Coastline"
            className="animate-pulse-subtle h-full w-full scale-105 object-cover"
          />
          {/* Enhanced Overlay for readability */}
          <div className="from-ocean-blue/95 via-ocean-blue/60 absolute inset-0 bg-gradient-to-r to-transparent" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-4 md:px-6">
          <div className="animate-slide-up max-w-4xl">
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

      {/* 2. NAVIGATION GRID (Bento Box Style) */}
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
              href="/towns"
            />
            <CategoryCard
              icon={BookOpen}
              title="History & Archive"
              description="Digital archives of historical documents, genealogies, and timelines."
              colorClass="bg-bougainvillea-pink"
              href="/history"
            />
            <CategoryCard
              icon={Compass}
              title="Tourism Directory"
              description="Curated listings of local hotels, restaurants, and guides."
              colorClass="bg-valley-green"
              href="/directory"
            />
            <CategoryCard
              icon={Music}
              title="Culture & Arts"
              description="The home of Morna, festivals, and local artisans."
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

      {/* 4. VOICES OF BRAVA (Social Proof) - NEW SECTION */}
      <section className="bg-background-secondary border-border-secondary border-y py-20">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeader
            title="Voices of the Island"
            subtitle="Stories and experiences from our community members and visitors."
            centered
          />
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} item={t} />
            ))}
          </div>

          {/* Stats Bar Integrated */}
          <div className="mt-16 grid grid-cols-2 divide-x divide-gray-200 md:grid-cols-4">
            <div className="px-4 text-center">
              <div className="text-ocean-blue font-serif text-3xl font-bold">
                20+
              </div>
              <div className="text-volcanic-gray mt-1 text-xs tracking-wider uppercase">
                Towns
              </div>
            </div>
            <div className="px-4 text-center">
              <div className="text-ocean-blue font-serif text-3xl font-bold">
                150+
              </div>
              <div className="text-volcanic-gray mt-1 text-xs tracking-wider uppercase">
                Sites
              </div>
            </div>
            <div className="px-4 text-center">
              <div className="text-ocean-blue font-serif text-3xl font-bold">
                500+
              </div>
              <div className="text-volcanic-gray mt-1 text-xs tracking-wider uppercase">
                Photos
              </div>
            </div>
            <div className="px-4 text-center">
              <div className="text-ocean-blue font-serif text-3xl font-bold">
                100%
              </div>
              <div className="text-volcanic-gray mt-1 text-xs tracking-wider uppercase">
                Community
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE MAP TEASER */}
      <section className="relative overflow-hidden bg-white py-20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="relative z-10 container mx-auto px-4 md:px-6">
          <div className="border-border-secondary flex flex-col items-center gap-12 rounded-3xl border bg-white p-8 shadow-2xl md:p-12 lg:flex-row">
            {/* Text Content */}
            <div className="order-2 lg:order-1 lg:w-1/2">
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

              <Link
                href="/map"
                className="bg-ocean-blue hover:bg-ocean-blue/90 inline-flex items-center rounded-lg px-8 py-4 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                Open Interactive Map
              </Link>
            </div>

            {/* Visual/Map Placeholder */}
            <div className="order-1 w-full lg:order-2 lg:w-1/2">
              <div className="group relative aspect-square overflow-hidden rounded-2xl border-4 border-white bg-blue-50 shadow-inner transition-all duration-500 hover:shadow-2xl md:aspect-video">
                {/* Simulated Map UI */}
                <div className="absolute inset-0 bg-[url('https://www.openstreetmap.org/assets/osm_logo-5e45c775073289047970d4f20427847c0b028448b1116c4f9712760634129524.svg')] bg-center bg-no-repeat opacity-10" />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Brava_OpenStreetMap.png/600px-Brava_OpenStreetMap.png"
                  alt="Map of Brava"
                  className="h-full w-full object-cover opacity-80 mix-blend-multiply transition-opacity group-hover:opacity-100"
                />

                {/* Floating Markers */}
                <div className="animate-bounce-reaction absolute top-1/3 left-1/2 z-10 flex items-center gap-2 rounded-lg bg-white p-2 shadow-lg">
                  <div className="bg-bougainvillea-pink rounded-md p-1.5 text-white">
                    <Camera size={14} />
                  </div>
                  <div className="pr-1 text-xs font-bold text-gray-800">
                    Fajã d'Agua
                  </div>
                </div>

                <div className="absolute right-1/3 bottom-1/3 z-10 flex animate-pulse items-center gap-2 rounded-lg bg-white p-2 shadow-lg">
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

      {/* 6. NEWSLETTER / CTA */}
      <section className="bg-ocean-blue relative overflow-hidden py-24 text-white">
        <div className="relative z-10 container mx-auto max-w-3xl px-4 text-center">
          <div className="text-sunny-yellow mb-6 inline-block rounded-full bg-white/10 p-4 backdrop-blur-md">
            <Users size={32} />
          </div>
          <h2 className="mb-6 font-serif text-4xl font-bold md:text-5xl">
            Join the Brava Community
          </h2>
          <p className="mb-10 text-lg leading-relaxed text-white/80">
            Whether you are a local, part of the diaspora, or a visitor, stay
            connected with the latest stories, events, and updates from Nos
            Ilha.
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
          <p className="mt-6 text-xs text-white/40">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
}
