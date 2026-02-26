"use client";

import {
  ExploreHeritageSection,
  HeroSectionNew,
  MapTeaserSection,
  NewsletterCtaSection,
} from "@/components/landing";
import { StickyNav } from "@/components/ui/sticky-nav";
import type { DirectoryEntry } from "@/types/directory";

export interface HomePageContentProps {
  featuredEntries?: DirectoryEntry[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HomePageContent({ featuredEntries }: HomePageContentProps) {
  return (
    <div className="bg-canvas text-body relative -mt-16 transition-colors duration-700">
      {/* === Content Layer === */}
      <div className="bg-background-secondary relative">
        <HeroSectionNew />
        {/* Hero sticky nav: negative margin pulls it into the hero area.
            Hidden on mobile where MobileBottomNav handles navigation. */}
        <div className="-mt-16 hidden lg:block">
          <StickyNav heroMode />
        </div>

        {/* Unified onboarding + navigation: "What is NosIlha?" with 3 clickable pillars */}
        <ExploreHeritageSection />

        {/* Map section before Stories for progressive disclosure */}
        <MapTeaserSection />

        <NewsletterCtaSection />
      </div>
    </div>
  );
}
