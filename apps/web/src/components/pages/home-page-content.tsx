"use client";

import { motion } from "framer-motion";
import {
  ExploreHeritageSection,
  MapTeaserSection,
  NewsletterCtaSection,
} from "@/components/landing";
import type { DirectoryEntry } from "@/types/directory";
// import type { AnnouncementConfig } from "@/types/landing";
import { HeroSectionAtmospheric } from "../landing/hero-section-atmospheric";

// World Cup announcement - kept for future use
// const worldCupAnnouncement: AnnouncementConfig = {
//   id: "world-cup-2026",
//   href: "https://www.bbc.com/sport/football/articles/c04q0gd0yedo",
//   text: "Tubarões Azuis: Mundial 2026! Read the full story",
//   badge: "News",
//   icon: "trophy",
//   dismissible: false,
// };

export interface HomePageContentProps {
  featuredEntries?: DirectoryEntry[];
}

// "Bruma" Reveal Animation - Slower, softer entrance
const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10%" },
  transition: { duration: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }, // Custom bezier for "drifting" feel
} as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HomePageContent({ featuredEntries }: HomePageContentProps) {
  return (
    <main className="bg-canvas text-body relative -mt-16 overflow-hidden transition-colors duration-700">
      {/* === Atmospheric "Bruma" Layer === */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Subtle gradient blob that breathes with the page */}
        <div className="bg-ocean-blue/5 dark:bg-ocean-blue/10 animate-fog-flow absolute -top-[20%] -left-[10%] h-[50%] w-[70%] rounded-full blur-3xl" />
        <div className="bg-valley-green/5 dark:bg-valley-green/10 animate-pulse-subtle absolute top-[40%] -right-[10%] h-[40%] w-[60%] rounded-full blur-3xl" />
      </div>

      {/* === Content Layer (Z-10 to sit above mist) === */}
      <div className="bg-background-secondary relative z-10">
        {/* <HeroSection announcement={worldCupAnnouncement} /> */}
        <HeroSectionAtmospheric />

        {/* Unified onboarding + navigation: "What is NosIlha?" with 3 clickable pillars */}
        <ExploreHeritageSection />

        {/* Map section before Stories for progressive disclosure (reduce early cognitive load) */}
        <motion.div {...fadeInUp}>
          <MapTeaserSection />
        </motion.div>

        {/* <motion.div {...fadeInUp}>
          <FeaturedStoriesSection entries={featuredEntries} />
        </motion.div> */}

        <motion.div {...fadeInUp}>
          <NewsletterCtaSection />
        </motion.div>
      </div>
    </main>
  );
}
