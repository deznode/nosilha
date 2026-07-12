"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const BravaMap = dynamic(
  () =>
    import("@/features/map/components/brava-map").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="bg-surface-alt flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            className="text-brand h-10 w-10 animate-spin"
            aria-hidden="true"
          />
          <p className="text-brand animate-pulse font-serif text-lg font-bold">
            Loading Brava…
          </p>
        </div>
      </div>
    ),
  }
);

export default function MapPage() {
  return <BravaMap />;
}
