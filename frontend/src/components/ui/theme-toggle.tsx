"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import clsx from "clsx";
import { useTheme, useUiStore } from "@/stores/uiStore";
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

export interface ThemeToggleProps {
  variant?: "default" | "light";
}

export function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
  const isLight = variant === "light";
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
        "relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full",
        isLight
          ? "text-white drop-shadow-md hover:bg-white/10 hover:text-white"
          : "text-text-secondary hover:bg-background-secondary hover:text-text-primary",
        "focus-visible:ring-ocean-blue focus:outline-none focus-visible:ring-2",
        "transition-all duration-200"
      )}
      whileTap={{ scale: 0.95 }}
      title={`${getLabel()}. Click to cycle themes.`}
      aria-label={`Current theme: ${getLabel()}. Click to cycle themes.`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {getIcon()}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
