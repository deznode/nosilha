"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import clsx from "clsx";
import { motionDuration } from "@/lib/animation";

interface AnimatedButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  children: React.ReactNode;
  className?: string;
}

const variants = {
  primary:
    "bg-ocean-blue text-white hover:bg-ocean-blue/90 focus-visible:ring-ocean-blue",
  secondary:
    "bg-valley-green text-white hover:bg-valley-green/90 focus-visible:ring-valley-green",
  outline:
    "border-2 border-ocean-blue text-ocean-blue hover:bg-ocean-blue hover:text-white focus-visible:ring-ocean-blue",
  ghost:
    "text-text-primary hover:bg-background-secondary focus-visible:ring-ocean-blue",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export const AnimatedButton = forwardRef<
  HTMLButtonElement,
  AnimatedButtonProps
>(function AnimatedButton(
  {
    variant = "primary",
    size = "md",
    isLoading = false,
    icon,
    iconPosition = "left",
    children,
    className,
    disabled,
    ...props
  },
  ref
) {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      ref={ref}
      className={clsx(
        // Base styles
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "transition-all duration-200 ease-in-out",
        // Variant styles
        variants[variant],
        // Size styles
        sizes[size],
        // Disabled styles
        isDisabled && "pointer-events-none cursor-not-allowed opacity-50",
        // Custom className
        className
      )}
      initial={{ scale: 1 }}
      whileHover={!isDisabled ? { scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      disabled={isDisabled}
      {...props}
    >
      {/* Loading spinner */}
      {isLoading && (
        <motion.div
          className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{
            duration: motionDuration.slower * 3, // ~1.14s for spinner
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}

      {/* Left icon */}
      {icon && iconPosition === "left" && !isLoading && (
        <motion.div whileHover={{ rotate: 5 }} className="flex-shrink-0">
          {icon}
        </motion.div>
      )}

      {/* Button text */}
      <span className={clsx(isLoading && "opacity-70")}>{children}</span>

      {/* Right icon */}
      {icon && iconPosition === "right" && !isLoading && (
        <motion.div whileHover={{ rotate: 5 }} className="flex-shrink-0">
          {icon}
        </motion.div>
      )}
    </motion.button>
  );
});
