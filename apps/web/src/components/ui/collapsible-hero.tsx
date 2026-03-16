"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import clsx from "clsx";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

interface CollapsibleHeroProps {
  /** Title shown in the collapsed sticky bar */
  title: string;
  /** Back button href (if omitted, uses browser back) */
  backHref?: string;
  /** Full hero height class (mobile) */
  heightClass?: string;
  /** Hero content (image, overlay, etc.) */
  children: ReactNode;
  /** Additional classes for the outer wrapper */
  className?: string;
}

/**
 * A hero section that smoothly collapses into a 48px sticky bar on scroll (mobile only).
 * Desktop keeps the full hero with no collapse behavior.
 */
export function CollapsibleHero({
  title,
  backHref,
  heightClass = "h-[45vh] min-h-[300px]",
  children,
  className,
}: CollapsibleHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // On mobile: interpolate from full opacity to 0 as hero scrolls away
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  // Collapsed bar appears as hero scrolls away
  const barOpacity = useTransform(scrollYProgress, [0.6, 0.9], [0, 1]);

  const handleBack = () => {
    if (backHref) {
      window.location.href = backHref;
    } else {
      window.history.back();
    }
  };

  return (
    <div ref={heroRef} className={clsx("relative", className)}>
      {/* Full hero */}
      <div className={clsx("relative w-full overflow-hidden", heightClass)}>
        {isMobile ? (
          <motion.div
            style={{ opacity: heroOpacity }}
            className="h-full w-full"
          >
            {children}
          </motion.div>
        ) : (
          children
        )}
      </div>

      {/* Collapsed sticky bar (mobile only) */}
      {isMobile && (
        <motion.div
          style={{ opacity: barOpacity }}
          className="bg-surface/95 border-hairline pointer-events-auto fixed top-[var(--nav-offset,64px)] right-0 left-0 z-40 flex h-12 items-center gap-3 border-b px-4 shadow-sm backdrop-blur-sm"
        >
          <button
            onClick={handleBack}
            className="text-body hover:text-brand -ml-1 flex shrink-0 items-center rounded-full p-1 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-body truncate text-sm font-semibold">{title}</h2>
        </motion.div>
      )}
    </div>
  );
}
