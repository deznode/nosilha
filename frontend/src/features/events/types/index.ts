/**
 * Event Feature Types
 */

/**
 * Event types supported by the platform
 */
export type EventType =
  | "Festival"
  | "Music"
  | "Religious"
  | "Community"
  | "Sports"
  | "Diaspora";

/**
 * Full event data structure for event pages
 */
export interface Event {
  id: string;
  title: string;
  date: string; // ISO format YYYY-MM-DD
  time: string;
  location: string;
  description: string;
  image: string;
  type: EventType;
  isFeatured?: boolean;
}

/**
 * Simplified event item for compact displays (landing page, sidebar)
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
 * Filter options for event listing
 */
export type EventFilterType = EventType | "All";

/**
 * All available event types for filtering
 */
export const EVENT_TYPES: EventType[] = [
  "Festival",
  "Music",
  "Religious",
  "Community",
  "Sports",
  "Diaspora",
];

/**
 * Filter options including "All"
 */
export const EVENT_FILTER_OPTIONS: EventFilterType[] = ["All", ...EVENT_TYPES];
