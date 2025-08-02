"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface VideoHeroSectionProps {
  videoSrc: string;
  posterSrc?: string;
  title: string;
  subtitle?: string;
  overlayContent: {
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
    margin: "-10% 0px -10% 0px" 
  });
  
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = () => setReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

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
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
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
        ease: "easeOut",
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
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-blue/80 via-ocean-blue/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-valley-green/40 via-transparent to-ocean-blue/40" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl text-center">
          {/* Main Title */}
          <motion.div
            variants={textVariants}
            className="mb-6"
          >
            <h2 className="font-serif text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-4 text-xl text-white/90 sm:text-2xl">
                {subtitle}
              </p>
            )}
          </motion.div>

          {/* Progressive Text Overlays */}
          <div className="space-y-4">
            {overlayContent.map((content, index) => (
              <motion.div
                key={index}
                variants={overlayVariants}
                custom={content.delay}
                className="text-lg text-white/95 sm:text-xl font-serif"
              >
                <span className="inline-block rounded-lg bg-gradient-to-r from-ocean-blue/60 to-valley-green/60 px-6 py-3 backdrop-blur-sm border border-white/20 shadow-lg">
                  {content.text}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isInView ? 1 : 0, 
              y: isInView ? 0 : 20 
            }}
            transition={{ delay: 3, duration: 0.6 }}
            className="mt-16"
          >
            <div className="flex flex-col items-center text-white/80">
              <span className="mb-3 text-sm uppercase tracking-widest font-semibold">Explore Further</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="h-6 w-6 text-sunny-yellow"
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
            </div>
          </motion.div>
        </div>
      </div>

      {/* Reduced Motion Fallback Message */}
      {reducedMotion && (
        <div className="absolute bottom-6 right-6 z-20">
          <div className="rounded-lg bg-ocean-blue/70 px-4 py-2 text-sm text-white/95 backdrop-blur-sm border border-white/20 shadow-lg">
            Video paused for accessibility
          </div>
        </div>
      )}
    </motion.section>
  );
}