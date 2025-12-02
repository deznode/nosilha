import { Star, Music, Users, Globe } from "lucide-react";
import type { EventType } from "../types";

interface EventTypeBadgeProps {
  type: EventType;
}

const colors: Record<EventType, string> = {
  Festival:
    "bg-bougainvillea-pink/10 text-bougainvillea-pink border-bougainvillea-pink/20",
  Music: "bg-ocean-blue/10 text-ocean-blue border-ocean-blue/20",
  Religious: "bg-purple-100 text-purple-700 border-purple-200",
  Community: "bg-valley-green/10 text-valley-green border-valley-green/20",
  Sports: "bg-orange-100 text-orange-700 border-orange-200",
  Diaspora: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

const icons: Record<
  EventType,
  React.ComponentType<{ size: number; className?: string }>
> = {
  Festival: Star,
  Music: Music,
  Religious: Star,
  Community: Users,
  Sports: Users,
  Diaspora: Globe,
};

export function EventTypeBadge({ type }: EventTypeBadgeProps) {
  const Icon = icons[type];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[type]}`}
    >
      <Icon size={12} className="mr-1" />
      {type}
    </span>
  );
}
