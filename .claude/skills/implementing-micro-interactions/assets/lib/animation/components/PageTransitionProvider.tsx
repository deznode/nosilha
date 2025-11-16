// lib/animation/components/PageTransitionProvider.tsx
"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { motionDuration } from "../tokens";

/**
 * Wraps page content to provide subtle route transitions in the App Router.
 */
export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: motionDuration.page },
        }}
        exit={{
          opacity: 0,
          y: -6,
          transition: { duration: motionDuration.fast },
        }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
