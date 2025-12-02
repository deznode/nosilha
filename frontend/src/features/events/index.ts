// Events Feature - Public API
// Import from '@/features/events' instead of internal paths

// Components
export { EventCard } from "./components/EventCard";
export {
  EventGridCard,
  AnimatedEventGridCard,
} from "./components/EventGridCard";
export { EventGrid } from "./components/EventGrid";
export { EventFilters } from "./components/EventFilters";
export { EventTypeBadge } from "./components/EventTypeBadge";
export { FeaturedEvent } from "./components/FeaturedEvent";
export { EventHero } from "./components/EventHero";
export { SubmitEventCTA } from "./components/SubmitEventCTA";

// Hooks
export { useEventFilters } from "./hooks/useEventFilters";

// Data
export { EVENTS_DATA } from "./data/mock-events";

// Types
export type { Event, EventItem, EventType, EventFilterType } from "./types";

export { EVENT_TYPES, EVENT_FILTER_OPTIONS } from "./types";
