"use client";

import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import clsx from "clsx";
import { useNavHidden } from "@/lib/hooks/use-nav-hidden";

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
 * A hero section that collapses into a 48px sticky bar once the hero
 * is fully scrolled out of view AND the nav is hidden (mobile only).
 * The bar replaces the nav space rather than stacking below it.
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
  const router = useRouter();
  const navHidden = useNavHidden();
  const [heroPassed, setHeroPassed] = useState(false);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setHeroPassed(latest >= 0.95);
  });

  // Show bar only when hero is scrolled away AND nav is hidden (scrolling down)
  const showBar = navHidden && heroPassed;

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div ref={heroRef} className={clsx("relative", className)}>
      {/* Full hero */}
      <div className={clsx("relative w-full overflow-hidden", heightClass)}>
        {children}
      </div>

      {/* Collapsed sticky bar — replaces nav when hero is gone and nav hides */}
      {showBar && (
        <div className="bg-surface border-hairline shadow-subtle fixed top-0 right-0 left-0 z-50 flex h-12 items-center gap-3 border-b px-4">
          <button
            onClick={handleBack}
            className="text-body hover:text-brand -ml-1 flex shrink-0 items-center rounded-full p-1 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-body truncate text-sm font-semibold">{title}</h2>
        </div>
      )}
    </div>
  );
}
