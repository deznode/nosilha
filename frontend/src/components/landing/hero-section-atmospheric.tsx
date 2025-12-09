"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Search,
  ArrowRight,
  Heart,
  BookOpen,
  MapPin,
  Users,
  ChevronDown,
} from "lucide-react";

interface HeroSectionAtmosphericProps {
  className?: string;
}

export function HeroSectionAtmospheric({
  className,
}: HeroSectionAtmosphericProps) {
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleContribute = () => {
    router.push("/contribute");
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/directory?q=${encodeURIComponent(searchQuery)}`);
    }
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
      transition: { type: "spring" as const, stiffness: 50, damping: 20 },
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
      className={`relative h-[88vh] min-h-[600px] w-full overflow-hidden bg-stone-900 font-sans text-white selection:bg-amber-500/30 ${className ?? ""}`}
    >
      {/* --- 1. Background Layer with Ken Burns Effect --- */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          variants={backgroundVariants}
          animate="animate"
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
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent" />

      {/* Moving Mist/Light layers - Tuned to Warm/Dawn colors */}
      <motion.div
        variants={mistVariants1}
        animate="animate"
        className="absolute right-0 bottom-0 left-0 z-10 h-2/3 bg-gradient-to-t from-amber-900/20 via-rose-900/10 to-transparent blur-3xl"
      />
      {/* Secondary Mist Layer for depth */}
      <motion.div
        variants={mistVariants2}
        animate="animate"
        className="absolute right-0 bottom-0 left-0 z-10 h-1/2 bg-gradient-to-t from-orange-900/10 via-stone-800/10 to-transparent mix-blend-screen blur-2xl"
      />

      {/* --- 3. Main Content Container --- */}
      <div className="relative z-20 mx-auto flex h-full w-full max-w-7xl flex-col justify-end px-6 pb-24 md:pb-32 lg:px-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          {/* Badge */}
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
              diaspora. We are preserving oral histories and celebrating the
              resilience of our island culture.
            </p>
          </motion.div>

          {/* Interactive Area: Search & CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-start gap-5 md:flex-row md:items-center"
          >
            {/* Primary Actions */}
            <div className="flex w-full shrink-0 items-center gap-4 md:w-auto">
              <motion.button
                onClick={handleExplore}
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "rgba(255, 255, 255, 1)",
                }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex cursor-pointer items-center gap-2 rounded-lg bg-stone-100 px-6 py-3.5 font-semibold whitespace-nowrap text-stone-900 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-colors"
              >
                <BookOpen
                  size={18}
                  className="text-stone-600 transition-colors group-hover:text-stone-900"
                  aria-hidden="true"
                />
                Explore Heritage
              </motion.button>

              <motion.button
                onClick={handleContribute}
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                }}
                whileTap={{ scale: 0.98 }}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3.5 font-medium whitespace-nowrap text-white shadow-lg backdrop-blur-sm transition-colors hover:border-white/40"
              >
                <Heart
                  size={18}
                  className="text-amber-200"
                  aria-hidden="true"
                />
                Contribute
              </motion.button>
            </div>

            {/* Divider (Desktop) */}
            <div
              className="mx-2 hidden h-12 w-px bg-white/10 md:block"
              aria-hidden="true"
            />

            {/* Atmospheric Search Bar */}
            <div
              className={`group relative w-full transition-all duration-500 ease-out ${searchFocused ? "md:w-96" : "md:w-80"}`}
            >
              <div
                className={`absolute inset-0 rounded-lg bg-gradient-to-r from-amber-500/20 to-teal-500/20 opacity-0 blur transition-opacity duration-700 group-hover:opacity-100 ${searchFocused ? "opacity-100" : ""}`}
              />

              <form
                onSubmit={handleSearch}
                className="relative flex items-center overflow-hidden rounded-lg border border-white/20 bg-stone-900/60 shadow-inner backdrop-blur-md transition-colors focus-within:border-white/40 focus-within:bg-stone-900/80 hover:border-white/30"
              >
                <Search
                  size={18}
                  className="ml-4 text-stone-400"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  placeholder="Search history, towns, or stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full flex-1 border-none bg-transparent px-3 py-3.5 text-sm text-stone-200 placeholder-stone-400 outline-none focus:ring-0"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  aria-label="Search history, towns, or stories"
                />
                <motion.button
                  type="submit"
                  whileHover={{ x: 3 }}
                  className="pr-3 text-stone-400 hover:text-white"
                  aria-label="Submit search"
                >
                  <ArrowRight size={16} />
                </motion.button>
              </form>
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
        animate={{
          y: [-10, 10, -10],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute top-1/4 right-1/4 z-10 h-64 w-64 rounded-full bg-amber-400/5 mix-blend-screen blur-[80px]"
        aria-hidden="true"
      />
    </section>
  );
}

export default HeroSectionAtmospheric;
