// lib/animation/components/AnimatedButton.tsx
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { buttonMicro } from "../variants";

type Variant = "primary" | "secondary" | "ghost";

interface AnimatedButtonProps {
  children: ReactNode;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const variantClassName: Record<Variant, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500",
  secondary:
    "bg-slate-800 text-slate-50 hover:bg-slate-700 focus-visible:ring-slate-500",
  ghost:
    "bg-transparent text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-400",
};

export function AnimatedButton({
  children,
  variant = "primary",
  loading,
  disabled,
  className,
  type = "button",
}: AnimatedButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      className={[
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variantClassName[variant],
        isDisabled && "opacity-60 cursor-not-allowed",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      variants={buttonMicro}
      initial="initial"
      whileHover={isDisabled ? undefined : "hover"}
      whileTap={isDisabled ? undefined : "tap"}
      animate={isDisabled ? "disabled" : "initial"}
      disabled={isDisabled}
    >
      {children}
    </motion.button>
  );
}
