"use client";

import Link from "next/link";
import { X, List } from "lucide-react";
import { useShowSidebar, useMapStore } from "@/stores/mapStore";
import { StaticHibiscus } from "@/components/ui/logo";

export function MapHeader() {
  const showSidebar = useShowSidebar();
  const toggleSidebar = useMapStore((state) => state.toggleSidebar);

  return (
    <div className="pointer-events-none absolute top-0 right-0 left-0 z-40 flex items-start justify-between p-4 md:p-6">
      <Link
        href="/"
        className="pointer-events-auto flex items-center gap-4 rounded-2xl border border-white/40 bg-white/80 p-2 pr-6 shadow-xl backdrop-blur-md transition-transform hover:scale-[1.02] dark:border-white/20 dark:bg-white/10"
        aria-label="Back to home"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center">
          <StaticHibiscus className="h-full w-full drop-shadow-lg" />
        </div>
        <div>
          <h1 className="font-serif text-sm leading-tight font-bold">
            <span className="text-text-primary">Nos</span>
            <span className="text-ocean-blue">Ilha</span>
          </h1>
          <p className="text-muted font-sans text-[10px] font-bold tracking-widest uppercase">
            Brava, Cabo Verde
          </p>
        </div>
      </Link>
      <button
        onClick={toggleSidebar}
        className="pointer-events-auto rounded-xl border border-white/40 bg-white/80 p-3 text-text-primary shadow-xl backdrop-blur-md dark:border-white/20 dark:bg-white/10 dark:text-white md:hidden"
      >
        {showSidebar ? <X size={20} /> : <List size={20} />}
      </button>
    </div>
  );
}
