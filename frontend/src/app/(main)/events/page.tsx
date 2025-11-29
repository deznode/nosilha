"use client";

import React, { useState } from "react";
// import Link from 'next/link'; // Uncomment for Next.js
import {
  Calendar,
  MapPin,
  Clock,
  Search,
  ChevronRight,
  Music,
  Users,
  Star,
  Share2,
  PlusCircle,
  Globe, // Added Globe icon for Diaspora events
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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

// --- Types ---
// Added "Diaspora" to the event types
type EventType =
  | "Festival"
  | "Music"
  | "Religious"
  | "Community"
  | "Sports"
  | "Diaspora";

interface Event {
  id: string;
  title: string;
  date: string; // ISO format YYYY-MM-DD
  time: string;
  location: string;
  description: string;
  image: string;
  type: EventType;
  isFeatured?: boolean;
}

// --- Mock Data ---
const EVENTS_DATA: Event[] = [
  {
    id: "1",
    title: "Festa de São João Baptista",
    date: "2024-06-24",
    time: "All Day",
    location: "Vila Nova Sintra",
    description:
      "The biggest festival of the year! Processions, horse racing, drumming (Tamboreiros), and the traditional Colá San Jon.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/e8/Nova_Sintra_-_Pra%C3%A7a_Eug%C3%A9nio_Tavares_03.jpg",
    type: "Festival",
    isFeatured: true,
  },
  {
    id: "2",
    title: "Nossa Senhora do Monte",
    date: "2024-08-15",
    time: "10:00 AM",
    location: "Nossa Senhora do Monte",
    description:
      "A major religious pilgrimage and celebration featuring mass, music, and community feasting.",
    image:
      "https://images.unsplash.com/photo-1542345754-52d373e21c32?q=80&w=2000&auto=format&fit=crop",
    type: "Religious",
  },
  {
    id: "3",
    title: "Morna Night at Kaza d'Morno",
    date: "2024-07-15",
    time: "8:00 PM",
    location: "Furna",
    description:
      "An intimate evening of acoustic Morna and Coladeira featuring local artists.",
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800",
    type: "Music",
  },
  {
    id: "4",
    title: "Eugénio Tavares Poetry Reading",
    date: "2024-10-18",
    time: "6:00 PM",
    location: "Museum Eugénio Tavares, Nova Sintra",
    description:
      "Celebrating the birthday of Brava's most famous poet with readings and discussions.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/6f/Eug%C3%A9nio_Tavares.jpg",
    type: "Community",
  },
  {
    id: "5",
    title: "Fajã d'Agua Beach Cleanup",
    date: "2024-09-21",
    time: "9:00 AM",
    location: "Fajã d'Agua Bay",
    description:
      "Community volunteer event to keep our beautiful natural pools clean. Lunch provided.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Faj%C3%A3_de_%C3%81gua_02.jpg/1280px-Faj%C3%A3_de_%C3%81gua_02.jpg",
    type: "Community",
  },
  {
    id: "6",
    title: "Brava Day USA 2024",
    date: "2024-07-05",
    time: "12:00 PM",
    location: "Pawtucket, RI (USA)",
    description:
      "The largest annual gathering of the Brava diaspora in the United States. Music, traditional food, and reconnecting with roots.",
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=800&auto=format&fit=crop",
    type: "Diaspora",
  },
];

// --- Sub-Components ---

const EventTypeBadge = ({ type }: { type: EventType }) => {
  const colors = {
    Festival:
      "bg-bougainvillea-pink/10 text-bougainvillea-pink border-bougainvillea-pink/20",
    Music: "bg-ocean-blue/10 text-ocean-blue border-ocean-blue/20",
    Religious: "bg-purple-100 text-purple-700 border-purple-200",
    Community: "bg-valley-green/10 text-valley-green border-valley-green/20",
    Sports: "bg-orange-100 text-orange-700 border-orange-200",
    Diaspora: "bg-indigo-100 text-indigo-700 border-indigo-200",
  };

  const icons = {
    Festival: Star,
    Music: Music,
    Religious: Star, // Or Cross if available
    Community: Users,
    Sports: Users, // Or Activity
    Diaspora: Globe,
  };

  const Icon = icons[type];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[type]}`}
    >
      <Icon size={12} className="mr-1" />
      {type}
    </span>
  );
};

// --- Main Page Component ---

export default function EventsPage() {
  const [filterType, setFilterType] = useState<EventType | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter Logic
  const filteredEvents = EVENTS_DATA.filter((event) => {
    const matchesType = filterType === "All" || event.type === filterType;
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Separate Featured Event
  const featuredEvent = EVENTS_DATA.find((e) => e.isFeatured);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-off-white min-h-screen font-sans">
      {/* 1. HERO HEADER */}
      <section className="bg-ocean-blue relative overflow-hidden py-20 text-white">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sunny-yellow mb-4 inline-flex items-center space-x-2 font-bold tracking-widest uppercase"
          >
            <Calendar className="h-5 w-5" />
            <span>Island & Diaspora Calendar</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 font-serif text-4xl font-bold md:text-6xl"
          >
            Celebrate Life in Brava
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto max-w-2xl text-xl leading-relaxed text-white/80"
          >
            From the rhythmic drums of São João to diaspora gatherings in the US
            and Europe, discover the events that connect our global community.
          </motion.p>
        </div>
      </section>

      {/* 2. SEARCH & FILTERS */}
      <section className="border-border-secondary sticky top-0 z-30 border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Search */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="group relative w-full md:w-96"
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="group-focus-within:text-ocean-blue h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search events or locations..."
                className="border-border-primary bg-background-secondary focus:ring-ocean-blue focus:border-ocean-blue block w-full rounded-lg border py-2 pr-3 pl-10 leading-5 placeholder-gray-500 transition-all focus:bg-white focus:ring-1 focus:outline-none sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="no-scrollbar flex w-full gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0"
            >
              {[
                "All",
                "Festival",
                "Music",
                "Religious",
                "Community",
                "Diaspora",
              ].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as EventType | "All")}
                  className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    filterType === type
                      ? "bg-ocean-blue text-white shadow-md"
                      : "text-text-secondary border-border-secondary border bg-white hover:bg-gray-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* 3. FEATURED EVENT (Only show if no search/filter active) */}
        <AnimatePresence>
          {featuredEvent && filterType === "All" && !searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-16"
            >
              <h2 className="text-text-primary mb-6 flex items-center font-serif text-2xl font-bold">
                <Star className="text-sunny-yellow fill-sunny-yellow mr-2" />{" "}
                Featured Event
              </h2>
              <div className="border-border-secondary flex flex-col overflow-hidden rounded-2xl border bg-white shadow-lg md:flex-row">
                <div className="relative h-64 md:h-auto md:w-2/3">
                  <Image
                    src={featuredEvent.image}
                    alt={featuredEvent.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-sunny-yellow text-ocean-blue rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase shadow-md">
                      Don't Miss
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-center bg-gradient-to-br from-white to-blue-50 p-8 md:w-1/3">
                  <EventTypeBadge type={featuredEvent.type} />
                  <h3 className="text-text-primary mt-4 mb-2 font-serif text-3xl font-bold">
                    {featuredEvent.title}
                  </h3>
                  <div className="text-text-secondary mb-6 space-y-3">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />{" "}
                      {new Date(featuredEvent.date).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" /> {featuredEvent.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />{" "}
                      {featuredEvent.location}
                    </div>
                  </div>
                  <p className="text-volcanic-gray mb-6 line-clamp-3">
                    {featuredEvent.description}
                  </p>
                  <div className="flex gap-3">
                    <button className="bg-ocean-blue hover:bg-ocean-blue/90 flex-1 rounded-lg px-4 py-3 font-bold text-white transition-colors">
                      Event Details
                    </button>
                    <button className="border-border-primary text-text-secondary rounded-lg border p-3 hover:bg-gray-50">
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. EVENT LIST GRID */}
        <div>
          <h2 className="text-text-primary mb-6 font-serif text-2xl font-bold">
            {filterType === "All" ? "Upcoming Events" : `${filterType} Events`}
          </h2>

          {filteredEvents.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredEvents.map((event) => (
                <motion.div key={event.id} variants={itemVariants}>
                  <Link
                    href={`/events/${event.id}`}
                    className="group border-border-secondary flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Card Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                      <div className="absolute top-3 left-3">
                        <EventTypeBadge type={event.type} />
                      </div>
                    </div>

                    {/* Date Badge (Left Side Layout) */}
                    <div className="flex flex-grow">
                      <div className="bg-off-white border-border-secondary flex w-16 flex-col items-center justify-start border-r pt-6 text-center">
                        <span className="text-ocean-blue text-xs font-bold tracking-wider uppercase">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </span>
                        <span className="text-text-primary font-serif text-2xl font-bold">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-grow p-5">
                        <h3 className="text-text-primary group-hover:text-ocean-blue mb-2 line-clamp-2 text-lg font-bold transition-colors">
                          {event.title}
                        </h3>
                        <div className="text-text-secondary mb-4 space-y-2 text-sm">
                          <div className="flex items-center">
                            <Clock className="mr-2 h-3.5 w-3.5 opacity-70" />{" "}
                            {event.time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-3.5 w-3.5 opacity-70" />{" "}
                            {event.location}
                          </div>
                        </div>
                        <p className="text-volcanic-gray line-clamp-2 text-sm">
                          {event.description}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="bg-off-white border-border-secondary text-ocean-blue flex items-center justify-between border-t px-5 py-3 text-xs font-semibold">
                      <span>View Details</span>
                      <ChevronRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-border-primary rounded-xl border border-dashed bg-white py-20 text-center"
            >
              <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="text-text-primary text-lg font-medium">
                No events found
              </h3>
              <p className="text-text-secondary">
                Try adjusting your search or filter.
              </p>
            </motion.div>
          )}
        </div>

        {/* 5. CTA: SUBMIT EVENT */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="from-valley-green mt-20 flex flex-col items-center justify-between rounded-3xl bg-gradient-to-r to-emerald-700 p-8 text-center text-white shadow-xl md:flex-row md:p-12 md:text-left"
        >
          <div className="mb-8 max-w-2xl md:mb-0">
            <h2 className="mb-4 font-serif text-3xl font-bold">
              Organizing a Community Event?
            </h2>
            <p className="text-lg text-white/90">
              Nosilha is built by the community, for the community. If you are
              hosting a festival, cleanup, or cultural gathering, list it here
              for free.
            </p>
          </div>
          <button className="text-valley-green flex items-center rounded-full bg-white px-8 py-4 font-bold whitespace-nowrap shadow-lg transition-all hover:bg-gray-100">
            <PlusCircle className="mr-2 h-5 w-5" />
            Submit an Event
          </button>
        </motion.div>
      </div>
    </div>
  );
}
