"use client";

import { BookOpen, PenTool } from "lucide-react";
import Link from "next/link";

export function FeaturedCTA() {
  return (
    <div className="flex flex-col items-start justify-center rounded-lg bg-[var(--color-ocean-blue)] p-8 text-white shadow-lg">
      <BookOpen className="mb-4 h-10 w-10 text-[var(--color-sunny)]" />
      <h3 className="mb-3 font-serif text-2xl font-bold">Share Your History</h3>
      <p className="mb-6 leading-relaxed text-blue-100">
        Do you have a memory of the island? A family story passed down through
        generations? Help us preserve our heritage.
      </p>
      <Link
        href="/contribute/story"
        className="hover:bg-surface flex items-center gap-2 rounded-md bg-white px-6 py-2 font-bold text-[var(--color-ocean-blue)] transition-colors"
      >
        <PenTool size={16} /> Contribute
      </Link>
    </div>
  );
}
