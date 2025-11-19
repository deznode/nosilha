"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useTheme, useUiStore } from "@/stores/uiStore";
import { iconFlip, motionDuration, motionEasing } from "@/lib/animation";

export function ThemeToggle() {
  const theme = useTheme();
  const setTheme = useUiStore((state) => state.setTheme);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Function to update system theme
    const updateSystemTheme = () => {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setSystemTheme(prefersDark ? "dark" : "light");
    };

    // Set initial system theme
    updateSystemTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateSystemTheme);

    // Apply initial theme
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    applyTheme(theme, prefersDark);

    // Cleanup listener
    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, [theme]);

  // Update theme when systemTheme changes (for system mode)
  useEffect(() => {
    if (theme === "system") {
      applyTheme("system", systemTheme === "dark");
    }
  }, [systemTheme, theme]);

  const applyTheme = (
    newTheme: "system" | "light" | "dark",
    systemPrefersDark: boolean
  ) => {
    const shouldBeDark =
      newTheme === "dark" || (newTheme === "system" && systemPrefersDark);

    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const cycleTheme = () => {
    const themes: ("system" | "light" | "dark")[] = ["system", "light", "dark"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];

    setTheme(nextTheme);
    applyTheme(nextTheme, systemTheme === "dark");
  };

  const getIcon = () => {
    const iconProps = {
      className: "h-5 w-5",
    };

    switch (theme) {
      case "light":
        return <SunIcon {...iconProps} />;
      case "dark":
        return <MoonIcon {...iconProps} />;
      case "system":
      default:
        return <ComputerDesktopIcon {...iconProps} />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case "light":
        return "Light mode";
      case "dark":
        return "Dark mode";
      case "system":
      default:
        return `System mode (${systemTheme})`;
    }
  };

  return (
    <motion.button
      onClick={cycleTheme}
      className={clsx(
        "relative inline-flex items-center justify-center rounded-md p-2",
        "text-text-secondary",
        "hover:bg-background-secondary hover:text-text-primary",
        "focus:ring-ocean-blue focus:ring-2 focus:outline-none focus:ring-inset",
        "transition-all duration-200"
      )}
      whileHover={{
        scale: 1.1,
        backgroundColor: "var(--color-background-secondary)",
      }}
      whileTap={{ scale: 0.95 }}
      title={`${getLabel()}. Click to cycle themes.`}
      aria-label={`Current theme: ${getLabel()}. Click to cycle themes.`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          variants={iconFlip}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          {getIcon()}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
