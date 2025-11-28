"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import clsx from "clsx";
import { useTheme, useUiStore } from "@/stores/uiStore";
import { iconFlip } from "@/lib/animation";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

// Apply theme helper - defined outside component to avoid recreation
function applyTheme(
  newTheme: "system" | "light" | "dark",
  systemPrefersDark: boolean
) {
  const shouldBeDark =
    newTheme === "dark" || (newTheme === "system" && systemPrefersDark);

  if (shouldBeDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function ThemeToggle() {
  const theme = useTheme();
  const setTheme = useUiStore((state) => state.setTheme);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const systemTheme = prefersDarkMode ? "dark" : "light";

  // Apply theme when theme or system preference changes
  useEffect(() => {
    applyTheme(theme, prefersDarkMode);
  }, [theme, prefersDarkMode]);

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
        return <Sun {...iconProps} />;
      case "dark":
        return <Moon {...iconProps} />;
      case "system":
      default:
        return <Monitor {...iconProps} />;
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
