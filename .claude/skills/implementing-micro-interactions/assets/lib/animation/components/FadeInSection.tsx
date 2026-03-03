// lib/animation/components/FadeInSection.tsx
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { makeFadeInUp } from "../factories";

const fadeInUp = makeFadeInUp();

/**
 * Section wrapper that fades and slides content up on first viewport entry.
 */
export function FadeInSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      className={className}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {children}
    </motion.section>
  );
}
