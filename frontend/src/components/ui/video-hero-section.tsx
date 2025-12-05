"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

interface VideoHeroSectionProps {
  videoSrc: string;
  posterSrc?: string;
  title: string;
  subtitle?: string;
  overlayContent?: {
    text: string;
    delay: number;
  }[];
  className?: string;
}

export function VideoHeroSection({
  videoSrc,
  posterSrc,
  title,
  subtitle,
  overlayContent,
  className = "",
}: VideoHeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(sectionRef, {
    once: false,
    margin: "-10% 0px -10% 0px",
  });

  const [isVideoReady, setIsVideoReady] = useState(false);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Handle video play/pause based on intersection
  useEffect(() => {
    if (videoRef.current && isVideoReady) {
      if (isInView && !reducedMotion) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isInView, isVideoReady, reducedMotion]);

  // Handle smooth scroll to next section
  const handleScrollToNext = () => {
    const nextSection = sectionRef.current?.nextElementSibling;
    if (nextSection) {
      nextSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const textVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100,
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: delay,
        duration: 0.8,
        ease: "easeOut" as const,
      },
    }),
  };

  return (
    <motion.section
      ref={sectionRef}
      className={`relative min-h-screen w-full overflow-hidden ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setIsVideoReady(true)}
          className="h-full w-full object-cover"
          aria-label="Aerial view of Vila Nova Sintra, the capital of Brava Island"
        />

        {/* Brand-colored Gradient Overlay for Text Readability */}
        <div className="from-ocean-blue/80 via-ocean-blue/30 absolute inset-0 bg-gradient-to-t to-transparent" />
        <div className="from-valley-green/40 to-ocean-blue/40 absolute inset-0 bg-gradient-to-r via-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl text-center">
          {/* Main Title */}
          <motion.div variants={textVariants} className="mb-6">
            <h1 className="font-serif text-4xl font-bold text-white sm:text-6xl md:text-7xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-6 font-sans text-lg leading-8 text-white/90 sm:text-xl">
                {subtitle}
              </p>
            )}
          </motion.div>

          {/* Progressive Text Overlays */}
          {overlayContent && overlayContent.length > 0 && (
            <div className="space-y-4">
              {overlayContent.map((content, index) => (
                <motion.div
                  key={index}
                  variants={overlayVariants}
                  custom={content.delay}
                  className="font-serif text-lg text-white/95 sm:text-xl"
                >
                  <span className="from-ocean-blue/60 to-valley-green/60 inline-block rounded-lg border border-white/20 bg-gradient-to-r px-6 py-3 shadow-lg backdrop-blur-sm">
                    {content.text}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scroll Indicator - Positioned at Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: isInView ? 1 : 0,
          y: isInView ? 0 : 20,
        }}
        transition={{ delay: 3, duration: 0.6 }}
        className="absolute bottom-44 left-1/2 z-20 -translate-x-1/2 transform"
      >
        <button
          onClick={handleScrollToNext}
          className="group focus:ring-sobrado-ochre/50 flex cursor-pointer flex-col items-center rounded-lg p-2 text-white/80 transition-colors duration-300 hover:text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
          aria-label="Scroll to next section to continue reading the story"
        >
          <span className="mb-3 font-sans text-sm font-semibold tracking-widest uppercase">
            Explore Further
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut" as const,
            }}
            className="text-sobrado-ochre h-6 w-6"
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="h-full w-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </button>
      </motion.div>

      {/* Reduced Motion Fallback Message */}
      {reducedMotion && (
        <div className="absolute right-6 bottom-6 z-20">
          <div className="bg-ocean-blue/70 rounded-lg border border-white/20 px-4 py-2 text-sm text-white/95 shadow-lg backdrop-blur-sm">
            Video paused for accessibility
          </div>
        </div>
      )}
    </motion.section>
  );
}
