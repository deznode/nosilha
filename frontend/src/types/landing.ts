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

/**
 * Event item for the calendar/events section
 */
export interface EventItem {
  id: string;
  day: string;
  month: string;
  title: string;
  location: string;
  type: "Music" | "Festival" | "Community";
}

/**
 * Category card configuration for navigation sections
 */
export interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  colorClass: string;
  href: string;
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
