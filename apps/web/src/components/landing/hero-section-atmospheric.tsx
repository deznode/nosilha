"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { UnifiedSearch } from "@/components/search";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";

interface HeroSectionAtmosphericProps {
  className?: string;
}

export function HeroSectionAtmospheric({
  className,
}: HeroSectionAtmosphericProps) {
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // --- Interaction Handlers ---
  const handleScrollDown = () => {
    const sections = document.querySelectorAll("section");
    const heritageSection = sections[1];
    if (heritageSection) {
      const rect = heritageSection.getBoundingClientRect();
      window.scrollTo({
        top: window.scrollY + rect.top - 60,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth",
      });
    }
  };

  // --- Animation Variants (entrance only, no continuous loops) ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  } as const;

  return (
    <section
      className={`relative h-[88vh] min-h-[720px] w-full overflow-hidden bg-stone-900 font-sans text-white selection:bg-amber-500/30 ${className ?? ""}`}
    >
      {/* --- 1. Background Layer (Static) --- */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="relative h-full w-full">
          <Image
            src="/images/hero.jpg"
            alt="Brava Island coastline at dawn"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-90"
          />
        </div>
      </div>

      {/* --- 2. Gradient Overlay --- */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-stone-950 via-stone-900/75 to-stone-900/30" />

      {/* --- 3. Main Content Container --- */}
      <div className="relative z-20 mx-auto flex h-full w-full max-w-7xl flex-col justify-end px-6 pt-16 pb-24 md:pt-20 md:pb-32 lg:px-12 lg:pt-24">
        <motion.div
          variants={shouldReduceMotion ? undefined : containerVariants}
          initial={shouldReduceMotion ? undefined : "hidden"}
          animate={shouldReduceMotion ? undefined : "visible"}
          className="relative max-w-3xl"
        >
          {/* Context Badges - Trust & Location */}
          <motion.div
            variants={shouldReduceMotion ? undefined : itemVariants}
            className="mb-6 flex items-center gap-3"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-amber-100/90 uppercase shadow-sm backdrop-blur-md">
              <Users size={12} aria-hidden="true" />
              Community-Led & Open Source
            </span>
            <span
              className="hidden h-1 w-1 rounded-full bg-white/40 sm:inline-block"
              aria-hidden="true"
            />
            <span className="hidden items-center gap-1.5 text-xs font-medium tracking-wide text-stone-300 uppercase shadow-sm sm:flex">
              <MapPin size={12} aria-hidden="true" />
              Ilha das Flores &bull; Cabo Verde
            </span>
          </motion.div>

          {/* Headlines - capped at text-6xl */}
          <motion.div
            variants={shouldReduceMotion ? undefined : itemVariants}
            className="mb-6 space-y-2"
          >
            <h1 className="bg-gradient-to-br from-white via-stone-200 to-stone-400 bg-clip-text font-serif text-4xl leading-[1.1] tracking-tight text-transparent drop-shadow-lg sm:text-5xl md:text-6xl">
              Discover the <br />
              <span className="font-light text-amber-50 italic">
                Soul of Brava
              </span>
            </h1>
            <p className="pl-1 font-serif text-lg text-amber-200/90 italic drop-shadow-md md:text-xl">
              &ldquo;Nos terra, nos gente, nos memoria.&rdquo;
            </p>
          </motion.div>

          {/* Description */}
          <motion.div
            variants={shouldReduceMotion ? undefined : itemVariants}
            className="mb-10 max-w-xl"
          >
            <p className="text-base leading-relaxed font-light text-stone-200 drop-shadow-md md:text-lg md:text-stone-100">
              A living archive connecting the people of Djabraba and the global
              diaspora. We preserve Brava's oral histories and celebrate the
              resilience of our island culture.
            </p>
          </motion.div>

          {/* Dual CTAs - CSS-only hover effects */}
          <motion.div
            variants={shouldReduceMotion ? undefined : itemVariants}
            className="flex flex-col gap-4 sm:flex-row"
          >
            {/* Primary CTA - Share Your Story */}
            <Link
              href="/contribute/story"
              className="bg-bougainvillea-pink hover:bg-bougainvillea-pink/90 group relative flex items-center justify-center gap-2.5 rounded-lg px-8 py-3 text-base font-semibold whitespace-nowrap text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
            >
              Share Your Story
              <ArrowRight
                size={18}
                className="text-white/90 transition-transform group-hover:translate-x-0.5 group-hover:text-white"
                aria-hidden="true"
              />
            </Link>

            {/* Secondary CTA - Explore Directory */}
            <Link
              href="/directory"
              className="flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-8 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
            >
              Explore Directory
            </Link>
          </motion.div>

          {/* Search Bar - Simplified focus state */}
          <motion.div
            variants={shouldReduceMotion ? undefined : itemVariants}
            className="mt-5 w-full max-w-lg"
          >
            <div
              className={`group relative transition-transform duration-300 ${searchFocused ? "scale-[1.01]" : ""}`}
            >
              <UnifiedSearch
                variant="hero"
                placeholder="Search stories, people, villages, or landmarks…"
                onFocusChange={setSearchFocused}
                onSearchSubmit={(query) =>
                  router.push(`/directory?q=${encodeURIComponent(query)}`)
                }
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* --- 4. Scroll Indicator --- */}
      <ScrollIndicator onClick={handleScrollDown} />
    </section>
  );
}

export default HeroSectionAtmospheric;
