"use client";
import React from "react";
import Image from "next/image";
import { HeroSection } from "@/components/landing/hero-section";

// Demo content section (page-level concern, not part of the reusable hero)
const ContentSection = () => (
  <section className="relative z-10 bg-[#F8FAFC] py-24 text-[#0F172A]">
    <div className="mx-auto max-w-7xl px-6">
      <div className="mb-12 border-l-4 border-[#C02669] pl-6">
        <h2 className="font-serif text-3xl font-bold md:text-4xl">
          Latest Stories
        </h2>
        <p className="mt-2 font-sans text-lg text-[#64748B]">
          Recently added memories from the community.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="group bg-surface shadow-subtle hover:shadow-medium relative overflow-hidden rounded-2xl transition-all hover:-translate-y-1"
          >
            <div className="relative aspect-[4/3] w-full bg-[#E2E8F0]">
              <Image
                src={`https://images.unsplash.com/photo-${item === 1 ? "1589553026367-1c60b73c4d51" : item === 2 ? "1596395817818-2e06d9d107a6" : "1534234828563-02597283995f"}?q=80&w=800&auto=format&fit=crop`}
                alt="Story Thumbnail"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="p-6">
              <span className="mb-2 block font-sans text-xs font-bold tracking-wider text-[#C02669] uppercase">
                Culture
              </span>
              <h3 className="mb-2 font-serif text-xl font-bold transition-colors group-hover:text-[#0E4C75]">
                The Fisherman&apos;s Tale of Faj&atilde; d&apos;&Aacute;gua
              </h3>
              <p className="mb-4 line-clamp-2 font-sans text-sm text-[#64748B]">
                An incredible story passed down through three generations about
                the great storm of 1982...
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-[#94A3B8]">
                <div className="h-6 w-6 rounded-full bg-[#E2E8F0]" />
                <span>Maria G.</span>
                <span>•</span>
                <span>2 days ago</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default function App() {
  return (
    <div className="relative min-h-screen font-sans selection:bg-[#C02669]/30 selection:text-white">
      <HeroSection />

      {/* Main Content */}
      <ContentSection />

      {/* More dummy content to demonstrate scrolling */}
      <section className="bg-canvas relative z-10 py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h3 className="mb-4 font-serif text-3xl font-bold text-[#0F172A]">
            Join the Preservation Effort
          </h3>
          <p className="text-[#64748B]">
            Help us digitize more stories from the islands.
          </p>
        </div>
      </section>
    </div>
  );
}
