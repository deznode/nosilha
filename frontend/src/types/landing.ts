/**
 * Types for Landing Page Components
 *
 * These types define the data structures used throughout the landing page
 * for featured content, events, and other display elements.
 */

import type { LucideIcon } from "lucide-react";

/**
 * Featured item for story cards and highlighted content
 */
export interface FeaturedItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  link: string;
}

// NOTE: EventItem type has been moved to @/features/events/types
// Import from '@/features/events' instead

/**
 * Category card configuration for navigation sections
 */
export interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  colorClass: string;
  href: string;
  /** Custom action text for the card link (defaults to "Explore Section") */
  actionText?: string;
}

/**
 * Section header configuration
 */
export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

/**
 * Kriolu proverb configuration
 */
export interface KrioluProverb {
  proverb: string;
  translation: string;
  href?: string;
}

/**
 * Weather data for the weather widget
 */
export interface WeatherData {
  temperature: string;
  location: string;
  condition: "sunny" | "cloudy" | "partly-cloudy" | "rainy";
}

/**
 * Stat item for community statistics
 */
export interface StatItemData {
  value: string;
  label: string;
}

/**
 * Quick access link for hero section
 */
export interface QuickAccessLink {
  label: string;
  href: string;
  emoji?: string;
}

/**
 * Available icons for announcement badges
 */
export type AnnouncementIconName = "trophy" | "megaphone" | "sparkles" | "bell";

/**
 * Announcement configuration for hero section
 */
export interface AnnouncementConfig {
  /** Unique ID for localStorage persistence */
  id: string;
  /** Link destination */
  href: string;
  /** Main announcement text */
  text: string;
  /** Badge label (e.g., "News", "Update") */
  badge?: string;
  /** Optional icon name for the badge */
  icon?: AnnouncementIconName;
  /** Whether the announcement can be dismissed (default: true) */
  dismissible?: boolean;
}
