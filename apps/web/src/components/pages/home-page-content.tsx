"use client";

import {
  ExploreHeritageSection,
  FeaturedHeritageSection,
  HeroSectionNew,
  InstagramFeedSection,
  MapTeaserSection,
  NewsletterCtaSection,
} from "@/components/landing";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";
import type { DirectoryEntry } from "@/types/directory";
import type { InstagramPost } from "@/lib/instagram";

export interface HomePageContentProps {
  featuredEntries?: DirectoryEntry[];
  instagramPosts?: InstagramPost[];
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

export function HomePageContent({
  featuredEntries: _featuredEntries,
  instagramPosts,
}: HomePageContentProps) {
  return (
    <div className="bg-canvas text-body relative -mt-16 transition-colors duration-700">
      {/* === Content Layer === */}
      <div className="bg-background-secondary relative">
        <HeroSectionNew />
        {/* Dark wrapper: bg matches hero's bottom gradient for seamless transition.
            The ArchiveBar in the (archive) layout is this route's chrome now
            (spec 034 FR-003), so the page no longer carries its own StickyNav. */}
        <div className="hidden bg-stone-950 lg:block">
          <div className="relative h-36">
            <ScrollIndicator onClick={scrollToNextSection} />
          </div>
        </div>

        {/* Spotlight card for featured heritage content */}
        <FeaturedHeritageSection />

        {/* Unified onboarding + navigation: "What is NosIlha?" with 3 clickable pillars */}
        <ExploreHeritageSection />

        {/* Map section placed early for progressive disclosure */}
        <MapTeaserSection />

        {instagramPosts && instagramPosts.length > 0 && (
          <InstagramFeedSection posts={instagramPosts} />
        )}

        <NewsletterCtaSection />
      </div>
    </div>
  );
}
