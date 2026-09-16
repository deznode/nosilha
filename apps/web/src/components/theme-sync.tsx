"use client";

import { useLayoutEffect } from "react";

import { resolveTheme } from "@/lib/theme/initial-theme";
import { useTheme } from "@/stores/uiStore";

/**
 * Keeps the `.dark` class on the root in step with `uiStore`. Spec 034 FR-001.
 *
 * The class used to be applied inside `ThemeToggle`'s own effect, which meant the
 * theme only changed on screens that happened to render that button. The archive
 * screens switch themes from the ArchiveBar pill instead, so the rule belongs to the
 * store, not to any one control.
 *
 * Two details this depends on, both learned the hard way:
 *
 * - It reads `matchMedia` directly rather than through `useMediaQuery`, whose
 *   `getServerSnapshot` returns `false`. React uses that snapshot for the hydration
 *   render, so resolving through the hook made this strip the `.dark` class the
 *   pre-hydration script had correctly set for a stored "system" choice on a dark OS.
 * - It runs in a layout effect, before paint, so any correction it does make is never
 *   a visible flash.
 */
export function ThemeSync() {
  const theme = useTheme();

  useLayoutEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      document.documentElement.classList.toggle(
        "dark",
        resolveTheme(theme, media.matches) === "dark"
      );
    };

    apply();

    // Only a "system" choice cares what the OS does later
    if (theme !== "system") return;

    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  return null;
}
