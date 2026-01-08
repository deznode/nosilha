"use client";

import { useRef } from "react";
import Image from "next/image";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";

interface ImageHeroSectionProps {
  imageSrc: string;
  imageAlt?: string;
  title: string;
  subtitle?: string;
  showScrollIndicator?: boolean;
  className?: string;
  heightClass?: string;
  maxHeightClass?: string;
}

/**
 * ImageHeroSection - Lightweight hero section with static image background
 *
 * Designed for bandwidth-conscious pages. Uses a static image instead of video
 * with a blue gradient overlay for text readability.
 */
export function ImageHeroSection({
  imageSrc,
  imageAlt = "Hero background image",
  title,
  subtitle,
  showScrollIndicator = true,
  className = "",
  heightClass = "h-[65vh]",
  maxHeightClass = "max-h-[600px]",
}: ImageHeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

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

  return (
    <section
      ref={sectionRef}
      className={`relative flex ${heightClass} min-h-[400px] ${maxHeightClass} w-full items-center justify-center overflow-hidden ${className}`}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-blue/70 via-ocean-blue/40 to-ocean-blue/20" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl text-center">
          {/* Main Title */}
          <h1 className="font-serif text-4xl font-bold text-white drop-shadow-lg sm:text-5xl md:text-6xl">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="mt-4 font-sans text-lg leading-relaxed text-white/90 drop-shadow-md sm:text-xl md:mt-6">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      {showScrollIndicator && <ScrollIndicator onClick={handleScrollToNext} />}
    </section>
  );
}
