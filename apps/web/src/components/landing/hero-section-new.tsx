"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Users, BookOpen } from "lucide-react";
import clsx from "clsx";

import { UnifiedSearch } from "@/components/search";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";

// --- Motion Variants (static, hoisted to module scope) ---

const backgroundVariants = {
  animate: {
    scale: [1, 1.1, 1],
    x: ["0%", "-3%", "0%"],
    transition: {
      duration: 25,
      repeat: Infinity,
      repeatType: "mirror" as const,
      ease: "easeInOut" as const,
    },
  },
};

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

// --- Fixed Background with Ken Burns animation ---

function FixedBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="bg-ocean-blue-deep absolute inset-0 z-0 overflow-hidden">
      {/* Ken Burns animated image */}
      <motion.div
        variants={shouldReduceMotion ? undefined : backgroundVariants}
        animate={shouldReduceMotion ? undefined : "animate"}
        className="relative h-full w-full"
      >
        <Image
          src="/images/hero.jpg"
          alt="Brava Island coastline"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-70"
        />
      </motion.div>

      {/* Film grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/40 to-stone-900/60" />

      {/* Mist animation */}
      {!shouldReduceMotion && (
        <motion.div
          animate={{ x: [-20, 20, -20], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-0 bottom-0 left-0 h-1/2 bg-gradient-to-t from-stone-950 via-rose-900/10 to-transparent blur-3xl"
        />
      )}
    </div>
  );
}

// --- Hero Content (center-aligned) ---

function HeroContent() {
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

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

  return (
    <section className="relative flex h-full w-full items-center justify-center px-6 py-12 text-center font-sans text-white selection:bg-amber-500/30">
      <motion.div
        variants={shouldReduceMotion ? undefined : containerVariants}
        initial={shouldReduceMotion ? undefined : "hidden"}
        animate={shouldReduceMotion ? undefined : "visible"}
        className="relative max-w-4xl"
      >
        {/* Location Badge */}
        <motion.div
          variants={shouldReduceMotion ? undefined : itemVariants}
          className="mb-6 flex justify-center"
        >
          <div className="text-sunny-yellow flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase backdrop-blur-md">
            <span className="flex items-center gap-1">
              <Users size={12} className="text-sunny-yellow" />
              Community-Led
            </span>
            <span
              className="h-0.5 w-0.5 rounded-full bg-white/50"
              aria-hidden="true"
            />
            <span className="flex items-center gap-1 text-white/70">
              <MapPin size={12} />
              Ilha das Flores, CV
            </span>
          </div>
        </motion.div>

        {/* Headlines */}
        <motion.div
          variants={shouldReduceMotion ? undefined : itemVariants}
          className="mb-8 space-y-4"
        >
          <h1 className="bg-gradient-to-b from-white via-white to-white/70 bg-clip-text font-serif text-6xl leading-[1] tracking-tight text-transparent drop-shadow-sm md:text-8xl lg:text-9xl">
            Discover the <br />
            <span className="text-sunny-yellow font-light italic">
              Soul of Brava
            </span>
          </h1>
          <p className="font-serif text-xl text-stone-200/80 italic md:text-2xl">
            &ldquo;Nos terra, nos gente, nos memoria.&rdquo;
          </p>
        </motion.div>

        {/* Description */}
        <motion.div
          variants={shouldReduceMotion ? undefined : itemVariants}
          className="mx-auto mb-10 max-w-2xl"
        >
          <p className="text-base leading-relaxed font-light text-white/80 md:text-lg">
            A living archive connecting the people of Djabraba and the global
            diaspora. We preserve oral histories and celebrate the resilience of
            our island culture.
          </p>
        </motion.div>

        {/* Primary CTA */}
        <motion.div
          variants={shouldReduceMotion ? undefined : itemVariants}
          className="mb-6 flex justify-center"
        >
          <Link
            href="/gallery"
            className="bg-bougainvillea-pink hover:bg-bougainvillea-pink/90 group shadow-bougainvillea-pink/30 relative flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white shadow-xl transition-all duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
          >
            <BookOpen size={20} className="text-white/90" aria-hidden="true" />
            <span>Start Exploring Brava</span>
          </Link>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          variants={shouldReduceMotion ? undefined : itemVariants}
          className="mx-auto w-full max-w-lg"
        >
          <div
            className={clsx(
              "group relative transition-transform duration-300",
              searchFocused && "scale-[1.01]"
            )}
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

      {/* Scroll Indicator — visible on mobile; desktop version rendered via children */}
      <ScrollIndicator onClick={handleScrollDown} className="lg:hidden" />
    </section>
  );
}

interface HeroSectionNewProps {
  className?: string;
  children?: React.ReactNode;
}

export function HeroSectionNew({ className, children }: HeroSectionNewProps) {
  return (
    <div className={clsx("relative", className)}>
      <FixedBackground />
      <div className="relative z-10">
        <div className="flex h-[calc(100svh-5rem)] items-center justify-center overflow-hidden lg:h-[calc(100svh-12rem)]">
          <HeroContent />
        </div>
        {children}
      </div>
    </div>
  );
}

