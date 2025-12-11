"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { BookOpen, ChevronDown, MapPin, Users } from "lucide-react";
import { UnifiedSearch } from "@/components/search";
import { springs } from "@/lib/animation/tokens";

interface HeroSectionAtmosphericProps {
  className?: string;
}

export function HeroSectionAtmospheric({
  className,
}: HeroSectionAtmosphericProps) {
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Scroll-linked opacity for scroll indicator - fades out as user scrolls
  const { scrollYProgress } = useScroll();
  const scrollIndicatorOpacity = useTransform(
    scrollYProgress,
    [0, 0.05, 0.1], // 0% to 10% scroll progress
    [1, 1, 0] // Fully visible, then fade out
  );

  // --- Interaction Handlers ---
  const handleExplore = () => {
    router.push("/history");
  };

  const handleScrollDown = () => {
    // Find the heritage section (the one with rounded top corners that overlaps the hero)
    const sections = document.querySelectorAll("section");
    const heritageSection = sections[1]; // Second section after hero
    if (heritageSection) {
      const rect = heritageSection.getBoundingClientRect();
      window.scrollTo({
        top: window.scrollY + rect.top - 60, // 60px padding shows rounded corners
        behavior: "smooth",
      });
    } else {
      // Fallback to original behavior
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth",
      });
    }
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: springs.ambient,
    },
  };

  // Background "Ken Burns" effect - slow, breathing motion
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

  // Atmospheric "Mist" layers - Layer 1 (Base Fog)
  const mistVariants1 = {
    animate: {
      x: ["-5%", "5%", "-5%"],
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  // Atmospheric "Mist" layers - Layer 2 (Drifting Haze)
  const mistVariants2 = {
    animate: {
      x: ["5%", "-5%", "5%"],
      opacity: [0.2, 0.4, 0.2],
      transition: {
        duration: 22,
        repeat: Infinity,
        ease: "easeInOut" as const,
        delay: 2,
      },
    },
  };

  // Scroll Indicator Animation
  const scrollIndicatorVariants = {
    animate: {
      y: [0, 8, 0],
      opacity: [0.4, 1, 0.4],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  return (
    <section
      className={`relative h-[88vh] min-h-[720px] w-full overflow-hidden bg-stone-900 font-sans text-white selection:bg-amber-500/30 ${className ?? ""}`}
    >
      {/* --- 1. Background Layer with Ken Burns Effect --- */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          variants={shouldReduceMotion ? undefined : backgroundVariants}
          animate={shouldReduceMotion ? undefined : "animate"}
          className="relative h-full w-full"
        >
          <Image
            src="/images/hero.jpg"
            alt="Brava Island coastline at dawn"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-90"
          />
        </motion.div>

        {/* Grain Overlay for "Memory/Film" Texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* --- 2. Atmospheric Overlays --- */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-stone-950 via-stone-900/75 to-stone-900/30" />

      {/* Moving Mist/Light layers - Tuned to Warm/Dawn colors */}
      <motion.div
        variants={shouldReduceMotion ? undefined : mistVariants1}
        animate={shouldReduceMotion ? undefined : "animate"}
        className="absolute right-0 bottom-0 left-0 z-10 h-2/3 bg-gradient-to-t from-amber-900/20 via-rose-900/10 to-transparent blur-3xl"
      />
      {/* Secondary Mist Layer for depth */}
      <motion.div
        variants={shouldReduceMotion ? undefined : mistVariants2}
        animate={shouldReduceMotion ? undefined : "animate"}
        className="absolute right-0 bottom-0 left-0 z-10 h-1/2 bg-gradient-to-t from-orange-900/10 via-stone-800/10 to-transparent mix-blend-screen blur-2xl"
      />

      {/* --- 3. Main Content Container --- */}
      <div className="relative z-20 mx-auto flex h-full w-full max-w-7xl flex-col justify-end px-6 pt-16 pb-24 md:pt-20 md:pb-32 lg:px-12 lg:pt-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative max-w-3xl"
        >
          {/* Context Badges - Trust & Location */}
          <motion.div
            variants={itemVariants}
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

          {/* Headlines */}
          <motion.div variants={itemVariants} className="mb-6 space-y-2">
            <h1 className="bg-gradient-to-br from-white via-stone-200 to-stone-400 bg-clip-text font-serif text-5xl leading-[1.1] tracking-tight text-transparent drop-shadow-lg md:text-7xl lg:text-8xl">
              Discover the <br />
              <span className="font-light text-amber-50 italic">
                Soul of Brava
              </span>
            </h1>
            <p className="pl-1 font-serif text-xl text-amber-200/90 italic drop-shadow-md md:text-2xl">
              &ldquo;Nos terra, nos gente, nos memoria.&rdquo;
            </p>
          </motion.div>

          {/* Description */}
          <motion.div variants={itemVariants} className="mb-10 max-w-xl">
            <p className="text-lg leading-relaxed font-light text-stone-200 drop-shadow-md md:text-stone-100">
              A living archive connecting the people of Djabraba and the global
              diaspora. We preserve Brava’s oral histories and celebrate the
              resilience of our island culture.
            </p>
          </motion.div>

          {/* Primary CTA - Single focused action to reduce decision paralysis */}
          <motion.div variants={itemVariants}>
            <motion.button
              onClick={handleExplore}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 40px -5px rgba(192, 38, 105, 0.6)",
              }}
              whileTap={{ scale: 0.97 }}
              transition={springs.hover}
              className="bg-bougainvillea-pink shadow-bougainvillea-pink/40 hover:bg-bougainvillea-pink/90 focus-visible:ring-offset-bougainvillea-pink group relative flex min-w-[240px] cursor-pointer items-center gap-2.5 rounded-xl px-6 py-5 text-base font-semibold whitespace-nowrap text-white shadow-2xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 md:px-8"
            >
              <BookOpen
                size={20}
                className="text-white/90 transition-colors group-hover:text-white"
                aria-hidden="true"
              />
              Start Exploring Brava
            </motion.button>
          </motion.div>

          {/* Search Bar - Separate section below CTAs */}
          <motion.div variants={itemVariants} className="mt-5 w-full max-w-lg">
            <div
              className={`group relative transition-all duration-500 ease-out ${searchFocused ? "scale-[1.02]" : ""}`}
            >
              <div
                className={`absolute inset-0 rounded-lg bg-gradient-to-r from-amber-500/20 to-teal-500/20 opacity-0 blur transition-opacity duration-700 group-hover:opacity-100 ${searchFocused ? "opacity-100" : ""}`}
              />

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

      {/* --- 4. Scroll Indicator (Clickable) - Fades out on scroll --- */}
      <motion.button
        style={{ opacity: scrollIndicatorOpacity }}
        onClick={handleScrollDown}
        className="group absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 transform cursor-pointer flex-col items-center gap-2 transition-colors hover:text-white"
        aria-label="Scroll down to content"
      >
        <span className="text-[10px] tracking-[0.2em] text-stone-400/80 uppercase transition-colors group-hover:text-white">
          Scroll
        </span>
        <motion.div variants={scrollIndicatorVariants} animate="animate">
          <ChevronDown
            size={20}
            className="text-stone-300/80 transition-colors group-hover:text-white"
          />
        </motion.div>
      </motion.button>

      {/* --- 5. Floating Elements (Subtle foreground layer) --- */}
      <motion.div
        animate={
          shouldReduceMotion
            ? undefined
            : {
                y: [-10, 10, -10],
                opacity: [0.4, 0.7, 0.4],
              }
        }
        transition={
          shouldReduceMotion
            ? undefined
            : {
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
        className="pointer-events-none absolute top-1/4 right-1/4 z-10 h-64 w-64 rounded-full bg-amber-400/5 mix-blend-screen blur-[80px]"
        aria-hidden="true"
      />
    </section>
  );
}

export default HeroSectionAtmospheric;
