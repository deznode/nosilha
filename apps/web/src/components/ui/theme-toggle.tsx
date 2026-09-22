"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import clsx from "clsx";
import { useTheme, useUiStore } from "@/stores/uiStore";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

// The `.dark` class is applied by `ThemeSync` in the root layout, from `uiStore`
// (spec 034 FR-001). This component only records the choice. It used to apply the
// class itself, which meant the theme changed only on screens rendering this button
// — and its copy of the rule read `useMediaQuery`, whose server snapshot is `false`
// during hydration, so a stored "system" choice on a dark OS flashed light.

export interface ThemeToggleProps {
  variant?: "default" | "light";
  /** Show circular container like other icon buttons */
  showContainer?: boolean;
  /**
   * `square` is the 44px bordered control the site chrome uses (spec 037). Given
   * as a variant rather than a `className` override because the base sets
   * `rounded-full`, and two radius utilities at equal specificity resolve by
   * stylesheet order, not by prop order.
   */
  shape?: "circle" | "square";
}

export function ThemeToggle({
  variant = "default",
  showContainer = true,
  shape = "circle",
}: ThemeToggleProps) {
  const isLight = variant === "light";

  // Circular container styling (like ideate prototype)
  const containerClass = isLight
    ? "h-8 w-8 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
    : "h-8 w-8 rounded-full bg-surface border border-hairline flex items-center justify-center text-ocean-blue hover:bg-surface-alt transition-colors";
  const theme = useTheme();
  const setTheme = useUiStore((state) => state.setTheme);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const systemTheme = prefersDarkMode ? "dark" : "light";

  const cycleTheme = () => {
    const themes: ("system" | "light" | "dark")[] = ["system", "light", "dark"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];

    setTheme(nextTheme);
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
        "relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center",
        shape === "square"
          ? "border-hairline size-11 shrink-0 rounded-lg border"
          : "rounded-full",
        "focus-visible:ring-ocean-blue focus:outline-none focus-visible:ring-2",
        "transition-all duration-200"
      )}
      whileTap={{ scale: 0.95 }}
      title={`${getLabel()}. Click to cycle themes.`}
      aria-label={`Current theme: ${getLabel()}. Click to cycle themes.`}
    >
      {showContainer ? (
        <div className={containerClass}>
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              {getIcon()}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={clsx(
              isLight
                ? "text-white drop-shadow-md"
                : "text-muted hover:text-body"
            )}
          >
            {getIcon()}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.button>
  );
}
