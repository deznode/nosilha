"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Menu,
  X,
  Search,
  MapPin,
  Users,
  BookOpen,
  ChevronDown,
  Globe,
  Monitor,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// --- Mocks & Utilities ---
const useRouter = () => ({
  push: (path: string) => console.log(`[Router] Navigating to: ${path}`),
});

const springs = {
  ambient: { type: "spring" as const, stiffness: 50, damping: 20 },
  hover: { type: "spring" as const, stiffness: 400, damping: 25 },
};

const NAVIGATION_LINKS = [
  { name: "Home", href: "#" },
  { name: "Explore", href: "#", hasDropdown: true },
  { name: "Culture", href: "#", hasDropdown: true },
  { name: "Map", href: "#" },
];

// --- Internal Components ---

const NosilhaLogo = ({ className }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#C02669] to-[#D97706] shadow-lg shadow-[#C02669]/20">
      <div className="absolute inset-0 rounded-lg bg-white/20 blur-[1px]" />
      <span className="relative font-serif text-lg font-bold text-white">
        N
      </span>
    </div>
    <div className="flex flex-col">
      <span className="font-serif text-xl leading-none font-bold tracking-tight text-white">
        NosIlha
      </span>
      <span className="text-[0.5rem] font-bold tracking-[0.15em] text-white/80 uppercase opacity-70">
        Brava, CV
      </span>
    </div>
  </div>
);

interface SearchBarProps {
  placeholder?: string;
  onFocusChange?: (focused: boolean) => void;
  onSearchSubmit?: (value: string) => void;
}

const SearchBar = ({
  placeholder,
  onFocusChange,
  onSearchSubmit,
}: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (status: boolean) => {
    setIsFocused(status);
    if (onFocusChange) onFocusChange(status);
  };

  return (
    <div
      className={`relative w-full max-w-lg transition-all duration-300 ${isFocused ? "scale-105" : "scale-100"}`}
    >
      <div className="relative flex items-center overflow-hidden rounded-full border border-white/10 bg-black/40 p-1 shadow-2xl backdrop-blur-md transition-colors hover:border-white/20 hover:bg-black/50">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/50">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder={
            placeholder || "Search stories, people, villages, or landmarks..."
          }
          className="flex-1 bg-transparent px-2 font-sans text-sm text-white placeholder-white/50 focus:outline-none md:text-base"
          onFocus={() => handleFocus(true)}
          onBlur={() => handleFocus(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onSearchSubmit) {
              onSearchSubmit(e.currentTarget.value);
            }
          }}
        />
        {/* Subtle arrow indicator */}
        <div className="mr-3 text-white/30">
          <span className="sr-only">Submit</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
};

const StickyNav = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 1, rootMargin: "-1px 0px 0px 0px" }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Sentinel element to detect scroll position relative to top */}
      <div
        ref={sentinelRef}
        className="pointer-events-none absolute h-px w-full -translate-y-px opacity-0"
      />

      {/* Sticky Container */}
      <div
        className={`sticky top-0 z-50 w-full transition-all duration-500 ease-in-out ${isStuck ? "px-0 pb-0" : "px-4 pb-4"}`}
      >
        <div
          className={`mx-auto flex h-16 items-center justify-between border-white/10 bg-[#0F172A]/90 shadow-2xl backdrop-blur-xl transition-all duration-500 ease-in-out ${
            isStuck
              ? "max-w-full rounded-none border-b px-6"
              : "max-w-6xl rounded-full border px-4"
          } `}
        >
          {/* Left: Logo */}
          <div className="flex shrink-0 items-center">
            <NosilhaLogo />
          </div>

          {/* Center: Navigation Links (Desktop) */}
          <nav className="hidden items-center gap-6 md:flex">
            {NAVIGATION_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="group flex items-center gap-1 font-sans text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                {link.name}
                {link.hasDropdown && (
                  <ChevronDown
                    size={14}
                    className="text-white/30 transition-transform group-hover:rotate-180 group-hover:text-white"
                  />
                )}
              </a>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="hidden items-center gap-3 md:flex">
            {/* Language */}
            <button className="flex items-center gap-1 text-xs font-bold text-white/70 hover:text-white">
              <Globe size={16} />
              <span>EN</span>
            </button>

            {/* Contribute Button */}
            <button className="flex items-center gap-1.5 rounded-full bg-[#0E4C75] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[#0E4C75]/20 transition-transform hover:-translate-y-0.5 hover:bg-[#0E4C75]/90">
              <Plus size={14} />
              Contribute
            </button>

            {/* Icons */}
            <div className="flex items-center gap-3 border-l border-white/10 pl-3">
              <button className="text-white/50 hover:text-white">
                <Monitor size={16} />
              </button>
              <button className="text-xs font-medium text-white/70 hover:text-white">
                Log in
              </button>
              <button className="text-xs font-medium text-white/70 hover:text-white">
                Sign up
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed inset-x-0 z-40 border-b border-white/10 bg-[#0F172A] p-4 shadow-2xl md:hidden ${isStuck ? "top-16" : "top-24 mx-4 rounded-2xl border"}`}
          >
            <nav className="flex flex-col gap-2">
              {NAVIGATION_LINKS.map((link) => (
                <a
                  key={link.name}
                  href="#"
                  className="block rounded-lg px-4 py-3 text-white hover:bg-white/5"
                >
                  {link.name}
                </a>
              ))}
              <div className="my-2 h-px bg-white/10" />
              <button className="w-full rounded-lg bg-[#0E4C75] py-3 font-bold text-white">
                Contribute
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const HeroContent = () => {
  const router = useRouter();

  const handleExplore = () => {
    router.push("/history");
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: springs.ambient,
    },
  };

  return (
    <div className="relative flex min-h-[85vh] w-full flex-col items-center justify-center px-6 pt-20 pb-12 text-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
        }}
        className="relative max-w-4xl"
      >
        {/* Location Badge */}
        <motion.div
          variants={itemVariants}
          className="mb-6 flex justify-center"
        >
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-1.5 text-[10px] font-bold tracking-widest text-[#FBBF24] uppercase backdrop-blur-md">
            <span className="flex items-center gap-1">
              <Users size={12} className="text-[#FBBF24]" />
              Community-Led
            </span>
            <span className="h-0.5 w-0.5 rounded-full bg-white/50" />
            <span className="flex items-center gap-1 text-white/70">
              <MapPin size={12} />
              Ilha das Flores, CV
            </span>
          </div>
        </motion.div>

        {/* Headlines */}
        <motion.div variants={itemVariants} className="mb-8 space-y-4">
          <h1 className="bg-gradient-to-b from-white via-white to-white/70 bg-clip-text font-serif text-6xl leading-[1] tracking-tight text-transparent drop-shadow-sm md:text-8xl lg:text-9xl">
            Discover the <br />
            <span className="font-light text-[#FBBF24] italic">
              Soul of Brava
            </span>
          </h1>
          <p className="font-serif text-xl text-[#E2E8F0]/80 italic md:text-2xl">
            &ldquo;Nos terra, nos gente, nos memoria.&rdquo;
          </p>
        </motion.div>

        {/* Description */}
        <motion.div variants={itemVariants} className="mx-auto mb-10 max-w-2xl">
          <p className="text-base leading-relaxed font-light text-white/80 md:text-lg">
            A living archive connecting the people of Djabraba and the global
            diaspora. We preserve oral histories and celebrate the resilience of
            our island culture.
          </p>
        </motion.div>

        {/* Primary CTA Button (Pink) */}
        <motion.div
          variants={itemVariants}
          className="mb-6 flex justify-center"
        >
          <motion.button
            onClick={handleExplore}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative flex items-center gap-2 rounded-xl bg-[#C02669] px-8 py-4 text-base font-bold text-white shadow-xl shadow-[#C02669]/30 transition-all hover:bg-[#C02669]/90"
          >
            <BookOpen size={20} className="text-white/90" />
            <span>Start Exploring Brava</span>
          </motion.button>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={itemVariants} className="mx-auto w-full max-w-lg">
          <SearchBar />
        </motion.div>
      </motion.div>
    </div>
  );
};

const FixedBackground = () => {
  const shouldReduceMotion = useReducedMotion();

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

  return (
    <div className="fixed inset-0 z-0 h-full w-full overflow-hidden bg-[#0F172A]">
      <motion.div
        variants={shouldReduceMotion ? undefined : backgroundVariants}
        animate={shouldReduceMotion ? undefined : "animate"}
        className="relative h-full w-full"
      >
        <Image
          src="/images/hero.jpg"
          alt="Brava Island coastline"
          fill
          className="object-cover object-center opacity-70"
          priority
        />
      </motion.div>

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-[#0F172A]/60" />

      {/* Mist Animation */}
      <motion.div
        animate={{ x: [-20, 20, -20], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-0 bottom-0 left-0 h-1/2 bg-gradient-to-t from-[#0F172A] via-rose-900/10 to-transparent blur-3xl"
      />
    </div>
  );
};

// --- Exported Component ---

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  return (
    <div className={className}>
      {/* Fixed Background */}
      <FixedBackground />

      {/* Scrollable Container */}
      <div className="relative z-10 flex flex-col">
        <HeroContent />
        <StickyNav />
      </div>
    </div>
  );
}
