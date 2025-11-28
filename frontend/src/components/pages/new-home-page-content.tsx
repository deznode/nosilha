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

export interface NewHomePageContentProps {
  featuredEntries?: DirectoryEntry[];
}

/**
 * NewHomePageContent - Main landing page orchestrator
 *
 * Composes all landing page sections into a cohesive page.
 * Accepts optional featured entries from the API to display
 * in the Featured Stories section.
 *
 * Sections:
 * 1. HeroSection - Hero with search and quick access
 * 2. ExploreHeritageSection - Category navigation grid
 * 3. LivingCultureSection - Events + Kriolu proverb + Weather
 * 4. FeaturedStoriesSection - Featured content (API or static)
 * 5. CommunityStatsSection - Archive statistics
 * 6. MapTeaserSection - Interactive map preview
 * 7. NewsletterCtaSection - Community signup CTA
 */
export function NewHomePageContent({
  featuredEntries,
}: NewHomePageContentProps) {
  return (
    <>
      <HeroSection />
      <ExploreHeritageSection />
      <LivingCultureSection />
      <FeaturedStoriesSection entries={featuredEntries} />
      <CommunityStatsSection />
      <MapTeaserSection />
      <NewsletterCtaSection />
    </>
  );
}
