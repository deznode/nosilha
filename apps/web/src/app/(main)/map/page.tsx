"use client";

import { PageHeader } from "@/components/ui/page-header";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the InteractiveMap component with SSR turned off.
const InteractiveMap = dynamic(
  () => import("@/features/map").then((mod) => mod.InteractiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="bg-background-secondary h-[600px] w-full animate-pulse rounded-lg" />
    ),
  }
);

export default function MapPage() {
  return (
    <div className="bg-background-secondary font-sans">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Interactive Map of Brava"
          subtitle="Explore every restaurant, landmark, and point of interest across the island."
        />
      </div>

      {/* The map component will be rendered on the client side */}
      <div className="h-[75vh] w-full">
        <Suspense
          fallback={<div className="bg-background-secondary h-full w-full" />}
        >
          <InteractiveMap />
        </Suspense>
      </div>
    </div>
  );
}
