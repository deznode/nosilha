"use client";

import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { resolveTheme } from "@/lib/theme/initial-theme";
import { useTheme } from "@/stores/uiStore";

export type ResolvedTheme = "light" | "dark";

/**
 * The theme actually on screen: the `uiStore` choice, with "system" resolved from
 * `prefers-color-scheme` the same way `ThemeToggle` applies it.
 *
 * For surfaces that must re-render on a theme switch because CSS cannot reach them —
 * the archive bar's pill label, the basemap style and the mini-map remount key.
 */
export function useResolvedTheme(): ResolvedTheme {
  const theme = useTheme();
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  return resolveTheme(theme, prefersDark);
}
