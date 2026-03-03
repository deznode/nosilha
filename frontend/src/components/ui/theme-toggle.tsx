"use client";

import { useEffect, useState } from "react";
import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon 
} from "@heroicons/react/24/outline";
import clsx from "clsx";

type Theme = "system" | "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Get stored theme preference or default to system
    const stored = localStorage.getItem("theme") as Theme;
    const initialTheme = stored || "system";
    setTheme(initialTheme);

    // Function to update system theme
    const updateSystemTheme = () => {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setSystemTheme(prefersDark ? "dark" : "light");
    };

    // Set initial system theme
    updateSystemTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateSystemTheme);

    // Apply initial theme
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(initialTheme, prefersDark);

    // Cleanup listener
    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, []);

  // Update theme when systemTheme changes (for system mode)
  useEffect(() => {
    if (theme === "system") {
      applyTheme("system", systemTheme === "dark");
    }
  }, [systemTheme, theme]);

  const applyTheme = (newTheme: Theme, systemPrefersDark: boolean) => {
    const shouldBeDark = 
      newTheme === "dark" || 
      (newTheme === "system" && systemPrefersDark);

    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const cycleTheme = () => {
    const themes: Theme[] = ["system", "light", "dark"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];

    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme, systemTheme === "dark");
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <SunIcon className="h-5 w-5" />;
      case "dark":
        return <MoonIcon className="h-5 w-5" />;
      case "system":
      default:
        return <ComputerDesktopIcon className="h-5 w-5" />;
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
    <button
      onClick={cycleTheme}
      className={clsx(
        "relative inline-flex items-center justify-center rounded-md p-2",
        "text-gray-500 dark:text-gray-300",
        "hover:bg-gray-100 dark:hover:bg-gray-700",
        "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ocean-blue",
        "transition-colors duration-200"
      )}
      title={`${getLabel()}. Click to cycle themes.`}
      aria-label={`Current theme: ${getLabel()}. Click to cycle themes.`}
    >
      {getIcon()}
    </button>
  );
}