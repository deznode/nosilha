import { MapPin } from "lucide-react";
import type { EventItem } from "@/types/landing";

interface EventCardProps {
  event: EventItem;
}

/**
 * EventCard - Displaying upcoming events
 *
 * Compact card with date badge, event type, title, and location.
 */
export function EventCard({ event }: EventCardProps) {
  return (
    <div className="border-border-secondary flex overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      {/* Date Badge */}
      <div className="bg-ocean-blue/5 border-border-secondary dark:bg-ocean-blue/10 flex w-20 flex-col items-center justify-center border-r p-2 text-center">
        <span className="text-ocean-blue text-xs font-bold tracking-wider uppercase">
          {event.month}
        </span>
        <span className="text-text-primary font-serif text-2xl font-bold">
          {event.day}
        </span>
      </div>

      {/* Event Details */}
      <div className="flex flex-grow flex-col justify-center p-4">
        <span className="text-bougainvillea-pink mb-1 text-xs font-bold">
          {event.type}
        </span>
        <h4 className="text-text-primary mb-1 text-lg leading-tight font-bold">
          {event.title}
        </h4>
        <div className="text-text-secondary flex items-center text-xs">
          <MapPin size={12} className="mr-1" /> {event.location}
        </div>
      </div>
    </div>
  );
}
