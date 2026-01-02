"use client";

import {
  ExploreHeritageSection,
  MapTeaserSection,
  NewsletterCtaSection,
} from "@/components/landing";
import type { DirectoryEntry } from "@/types/directory";
import { HeroSectionAtmospheric } from "../landing/hero-section-atmospheric";

export interface HomePageContentProps {
  featuredEntries?: DirectoryEntry[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HomePageContent({ featuredEntries }: HomePageContentProps) {
  return (
    <main className="bg-canvas text-body relative -mt-16 overflow-hidden transition-colors duration-700">
      {/* === Content Layer === */}
      <div className="bg-background-secondary relative">
        <HeroSectionAtmospheric />

        {/* Unified onboarding + navigation: "What is NosIlha?" with 3 clickable pillars */}
        <ExploreHeritageSection />

        {/* Map section before Stories for progressive disclosure */}
        <MapTeaserSection />

        <NewsletterCtaSection />
      </div>
    </main>
  );
}
