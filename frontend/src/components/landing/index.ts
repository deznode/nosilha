/**
 * Landing Page Components
 *
 * This barrel export provides all components for the landing page.
 * Components are organized into atomic (small, reusable) and
 * section (composed, page-specific) categories.
 */

// Atomic Components
export { SectionHeader } from "./section-header";
export { CategoryCard } from "./category-card";
export { FeaturedStoryCard } from "./featured-story-card";
export { KrioluProverbCard } from "./kriolu-proverb-card";

// Re-export EventCard from events feature for backward compatibility
export { EventCard } from "@/features/events";
export { WeatherWidget } from "./weather-widget";
export { StatItem } from "./stat-item";
export {
  AnnouncementPill,
  type AnnouncementPillProps,
  type AnnouncementIconName,
} from "./announcement-pill";

// Section Components
export { HeroSection } from "./hero-section";
export { ExploreHeritageSection } from "./explore-heritage-section";
export { LivingCultureSection } from "./living-culture-section";
export { FeaturedStoriesSection } from "./featured-stories-section";
export { CommunityStatsSection } from "./community-stats-section";
export { MapTeaserSection } from "./map-teaser-section";
export { NewsletterCtaSection } from "./newsletter-cta-section";
