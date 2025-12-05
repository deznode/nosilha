"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import type { QuickAccessLink } from "@/types/landing";
import { AnnouncementPill } from "./announcement-pill";
import type { AnnouncementIconName } from "./announcement-pill";

interface HeroSectionProps {
  quickLinks?: QuickAccessLink[];
  /** Optional announcement to display above the hero content */
  announcement?: {
    id: string;
    href: string;
    text: string;
    badge?: string;
    icon?: AnnouncementIconName;
    dismissible?: boolean;
  };
}

const defaultQuickLinks: QuickAccessLink[] = [
  { label: "Eugénio Tavares", href: "/people/eugenio-tavares", emoji: "📖" },
  { label: "Fajã d'Agua", href: "/towns/faja-dagua", emoji: "🌊" },
  { label: "Hotels", href: "/directory/hotels", emoji: "🏨" },
];

/**
 * HeroSection - Main hero with search and quick access
 *
 * Full-height hero section with background image, gradient overlay,
 * search functionality, and quick access chips.
 */
export function HeroSection({
  quickLinks = defaultQuickLinks,
  announcement,
}: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page
      window.location.href = `/directory?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <section className="relative flex h-[85vh] min-h-[600px] items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero.jpg"
          alt="Brava Island Coastline"
          fill
          className="scale-105 object-cover"
          priority
          sizes="100vw"
        />
        {/* Enhanced Overlay for readability */}
        <div className="from-ocean-blue/95 via-ocean-blue/60 absolute inset-0 bg-gradient-to-r to-transparent" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-4xl">
          {/* Announcement Pill */}
          {announcement && (
            <AnnouncementPill
              id={announcement.id}
              href={announcement.href}
              text={announcement.text}
              badge={announcement.badge}
              icon={announcement.icon}
              dismissible={announcement.dismissible ?? true}
            />
          )}

          {/* Tagline */}
          <div className="text-sobrado-ochre mb-6 flex items-center space-x-3 font-bold tracking-widest uppercase">
            <span className="bg-sobrado-ochre h-[3px] w-12 rounded-full" />
            <span className="text-sm md:text-base">
              Ilha das Flores • Cape Verde
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 font-serif text-5xl leading-tight font-bold text-white drop-shadow-lg md:text-7xl">
            Discover the <br />
            <span className="from-sobrado-ochre bg-gradient-to-r to-white bg-clip-text text-transparent">
              Soul of Brava
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mb-10 max-w-xl text-lg leading-relaxed text-white/90 drop-shadow-md md:text-xl">
            The definitive cultural heritage hub connecting the global diaspora
            to the history, people, and hidden gems of Brava Island.
          </p>

          {/* Search Bar - Glassmorphism */}
          <form
            onSubmit={handleSearch}
            className="group relative mb-10 max-w-xl"
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
              <Search className="group-focus-within:text-ocean-blue text-basalt-500 h-5 w-5 transition-colors" />
            </div>
            <input
              type="text"
              className="focus:ring-ocean-blue/30 focus:border-ocean-blue text-basalt-900 placeholder-basalt-500 block w-full rounded-full border border-white/20 bg-white/95 py-5 pr-32 pl-14 text-base shadow-2xl backdrop-blur-md transition-all outline-none focus:ring-4"
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
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:border-sobrado-ochre rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  {link.emoji && `${link.emoji} `}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
