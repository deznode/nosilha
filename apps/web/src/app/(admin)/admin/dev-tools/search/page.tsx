"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UnifiedSearch } from "@/components/search/unified-search";

export default function SearchDevPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/admin/dev-tools"
        className="text-muted hover:text-body mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dev Tools
      </Link>
      <h1 className="text-body mb-2 text-2xl font-bold">Unified Search</h1>
      <p className="text-muted mb-8">
        UnifiedSearch component in both default and hero variants.
      </p>

      <section className="mb-10">
        <h2 className="text-body mb-4 text-lg font-semibold">
          Default Variant
        </h2>
        <div className="max-w-xl">
          <UnifiedSearch
            variant="default"
            onSearchSubmit={(query) => console.log("Search submitted:", query)}
          />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-body mb-6 text-lg font-semibold">Hero Variant</h2>
        <div className="rounded-container bg-basalt-900 p-12">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="mb-4 font-serif text-3xl font-bold text-white">
              Discover Brava Island
            </h3>
            <p className="mb-6 text-white/70">
              Search for places, stories, and cultural heritage
            </p>
            <UnifiedSearch
              variant="hero"
              placeholder="Search stories, people, villages, or landmarks..."
              onSearchSubmit={(query) => console.log("Hero search:", query)}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
