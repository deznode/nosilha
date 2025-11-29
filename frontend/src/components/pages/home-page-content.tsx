"use client";

import { motion } from "framer-motion";
import {
  HeroSection,
  ExploreHeritageSection,
  LivingCultureSection,
  FeaturedStoriesSection,
  CommunityStatsSection,
  MapTeaserSection,
  NewsletterCtaSection,
} from "@/components/landing";
import type { DirectoryEntry } from "@/types/directory";
import type { AnnouncementConfig } from "@/types/landing";

const worldCupAnnouncement: AnnouncementConfig = {
  id: "world-cup-2026",
  href: "https://www.bbc.com/sport/football/articles/c04q0gd0yedo",
  text: "Tubarões Azuis: Mundial 2026! Read the full story",
  badge: "News",
  icon: "trophy",
  dismissible: false,
};

export interface HomePageContentProps {
  featuredEntries?: DirectoryEntry[];
}

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: "easeOut" },
} as const;

export function HomePageContent({ featuredEntries }: HomePageContentProps) {
  return (
    <main className="overflow-hidden">
      <HeroSection announcement={worldCupAnnouncement} />

      <motion.div {...fadeInUp}>
        <ExploreHeritageSection />
      </motion.div>

      <motion.div {...fadeInUp}>
        <LivingCultureSection />
      </motion.div>

      <motion.div {...fadeInUp}>
        <FeaturedStoriesSection entries={featuredEntries} />
      </motion.div>

      <motion.div {...fadeInUp}>
        <CommunityStatsSection />
      </motion.div>

      <motion.div {...fadeInUp}>
        <MapTeaserSection />
      </motion.div>

      <motion.div {...fadeInUp}>
        <NewsletterCtaSection />
      </motion.div>
    </main>
  );
}
