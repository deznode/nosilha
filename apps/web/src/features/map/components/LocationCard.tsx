"use client";

import Image from "next/image";
import { Navigation, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Location } from "../data/types";

interface LocationCardProps {
  location: Location;
  active: boolean;
  onClick: () => void;
}

export function LocationCard({ location, active, onClick }: LocationCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex cursor-pointer gap-4 rounded-2xl border p-3 transition-all duration-300",
        active
          ? "bg-ocean-blue/5 border-ocean-blue/30 shadow-sm"
          : "hover:bg-background-secondary hover:border-border-secondary border-transparent bg-transparent"
      )}
    >
      <div className="bg-background-tertiary relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
        <Image
          src={location.image}
          alt={location.name}
          fill
          sizes="80px"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="flex min-w-0 flex-col justify-center">
        <h3
          className={cn(
            "truncate font-serif text-sm font-bold",
            active ? "text-ocean-blue" : "text-text-primary"
          )}
        >
          {location.name}
        </h3>
        <div className="text-text-secondary mb-1 flex items-center gap-1 font-sans text-[11px] font-medium">
          <span className="tracking-wider uppercase">{location.category}</span>
          <span>&bull;</span>
          <span className="text-sunny-yellow flex items-center gap-0.5">
            <Star size={10} fill="currentColor" /> {location.rating}
          </span>
        </div>
        <p className="text-text-secondary mb-2 line-clamp-2 font-sans text-xs leading-relaxed">
          {location.description}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={cn(
            "flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors",
            active
              ? "bg-ocean-blue shadow-ocean-blue/20 text-white shadow-md"
              : "bg-background-tertiary text-text-secondary hover:bg-ocean-blue hover:text-white"
          )}
        >
          <Navigation
            size={12}
            className={active ? "text-white" : "text-current"}
          />
          Fly to
        </button>
      </div>
    </div>
  );
}
