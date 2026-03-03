// lib/animation/components/HoverCard.tsx
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { motionDuration, motionEasing } from "../tokens";

/**
 * Behavior: On hover, card lifts slightly and shadow deepens.
 * On tap, card compresses subtly.
 */
export function HoverCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.article
      className={[
        "rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      whileHover={{
        y: -2,
        boxShadow: "0 10px 25px rgba(15,23,42,0.55)",
        transition: {
          duration: motionDuration.fast,
          ease: motionEasing.out,
        },
      }}
      whileTap={{ scale: 0.99 }}
    >
      {children}
    </motion.article>
  );
}
