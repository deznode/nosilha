"use client";

import {
  ExploreHeritageSection,
  HeroSectionNew,
  MapTeaserSection,
  NewsletterCtaSection,
} from "@/components/landing";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";
import { StickyNav } from "@/components/ui/sticky-nav";
import type { DirectoryEntry } from "@/types/directory";

export interface HomePageContentProps {
  featuredEntries?: DirectoryEntry[];
}

const NAV_OFFSET_PX = 60;

function scrollToNextSection(): void {
  const sections = document.querySelectorAll("section");
  const target = sections[1];
  if (target) {
    window.scrollTo({
      top: window.scrollY + target.getBoundingClientRect().top - NAV_OFFSET_PX,
      behavior: "smooth",
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HomePageContent({ featuredEntries }: HomePageContentProps) {
  return (
    <div className="bg-canvas text-body relative -mt-16 transition-colors duration-700">
      {/* === Content Layer === */}
      <div className="bg-background-secondary relative">
        <HeroSectionNew />
        {/* Dark wrapper: bg matches hero's bottom gradient for seamless transition.
            StickyNav is at this DOM level so sticky top-0 works across the page. */}
        <div className="hidden bg-stone-950 lg:block">
          <StickyNav heroMode />
          <div className="relative h-36">
            <ScrollIndicator onClick={scrollToNextSection} />
          </div>
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
