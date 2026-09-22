import type { LucideIcon } from "lucide-react";
import { BookOpen, Grid3X3, Home, Map, Users } from "lucide-react";

/**
 * Shared public navigation config — the one place the site's destinations live.
 *
 * Before spec 037 five surfaces each kept their own list (`sticky-nav`,
 * `archive-bar`, `mobile-bottom-nav`, `footer`, `header`) and they disagreed:
 * `Stay` existed only in the archive bar, `Films` was missing from the bottom bar
 * entirely, and the footer carried a third set of legal links. `DESTINATIONS`
 * below is the single record; every surface now declares *membership and order*
 * as a list of keys, never a literal array of labels and hrefs.
 *
 * The admin chrome has its own equivalent in
 * `components/admin/layout/admin-nav-config.ts`.
 */

export type DropdownItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

export type NavItem =
  | { name: string; href: string; type?: "link" }
  | { name: string; type: "dropdown"; items: DropdownItem[] };

export type DestinationKey =
  | "home"
  | "settlements"
  | "culture"
  | "map"
  | "photographs"
  | "films"
  | "stay"
  | "about"
  | "contact"
  | "privacy"
  | "terms";

export type Destination = {
  key: DestinationKey;
  label: string;
  href: string;
  /** Only the bottom-bar destinations render an icon. */
  icon?: LucideIcon;
  /**
   * `"exact"` matches the href alone. An array matches any pathname starting with
   * one of its prefixes — `culture` lives at `/history` but must also light up on
   * `/people`.
   */
  activeMatch: "exact" | string[];
};

export const DESTINATIONS: Record<DestinationKey, Destination> = {
  home: {
    key: "home",
    label: "Home",
    href: "/",
    icon: Home,
    activeMatch: "exact",
  },
  settlements: {
    key: "settlements",
    label: "Settlements",
    href: "/settlements",
    icon: Grid3X3,
    activeMatch: ["/settlements"],
  },
  culture: {
    key: "culture",
    label: "Culture",
    href: "/history",
    icon: BookOpen,
    activeMatch: ["/history", "/people"],
  },
  map: {
    key: "map",
    label: "Map",
    href: "/map",
    icon: Map,
    activeMatch: "exact",
  },
  photographs: {
    key: "photographs",
    label: "Photographs",
    href: "/photographs",
    activeMatch: ["/photographs"],
  },
  films: {
    key: "films",
    label: "Films",
    href: "/films",
    activeMatch: ["/films"],
  },
  stay: { key: "stay", label: "Stay", href: "/stay", activeMatch: ["/stay"] },
  about: {
    key: "about",
    label: "About",
    href: "/about",
    activeMatch: "exact",
  },
  contact: {
    key: "contact",
    label: "Contact",
    href: "/contact",
    activeMatch: "exact",
  },
  privacy: {
    key: "privacy",
    label: "Privacy",
    href: "/privacy",
    activeMatch: "exact",
  },
  terms: { key: "terms", label: "Terms", href: "/terms", activeMatch: "exact" },
};

/** Phone thumb zone. `More` is synthetic and appended by the component. */
export const BOTTOM_BAR: DestinationKey[] = [
  "home",
  "settlements",
  "culture",
  "map",
];

/** Shown inline in the 768–1023 bar. */
export const TABLET_INLINE: DestinationKey[] = [
  "settlements",
  "culture",
  "map",
];

/** Behind `More ▾` in the 768–1023 bar. */
export const TABLET_OVERFLOW: DestinationKey[] = [
  "photographs",
  "films",
  "stay",
];

/**
 * The order the tablet bar would shed inline destinations in, if it ever needed
 * to. Logo, account and Contribute never collapse.
 *
 * Documented data only: the bar is specified not to wrap at any width in
 * 768–1023, so nothing consumes this yet. It is here so the decision is recorded
 * rather than rediscovered.
 */
export const TABLET_COLLAPSE_ORDER: DestinationKey[] = [
  "culture",
  "stay",
  "films",
  "photographs",
  "map",
  "settlements",
];

/** The More sheet's grid. Profile / Sign in is auth-conditional, appended by the component. */
export const SHEET_DESTINATIONS: DestinationKey[] = [
  "photographs",
  "films",
  "stay",
  "about",
  "contact",
];

/** The footer colophon's legal row. */
export const FOOTER_LEGAL: DestinationKey[] = [
  "about",
  "contact",
  "privacy",
  "terms",
];

export function resolve(keys: DestinationKey[]): Destination[] {
  return keys.map((key) => DESTINATIONS[key]);
}

export function isDestinationActive(
  destination: Destination,
  pathname: string
): boolean {
  if (destination.activeMatch === "exact") return pathname === destination.href;
  return destination.activeMatch.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * The desktop bar's menu. Derived from `DESTINATIONS` rather than written out, so
 * a label or href can no longer drift between the desktop bar and the rest of the
 * chrome. `Culture` keeps its dropdown shape, which only this surface uses.
 */
export const navigation: NavItem[] = [
  { name: DESTINATIONS.home.label, href: DESTINATIONS.home.href },
  {
    name: DESTINATIONS.culture.label,
    type: "dropdown",
    items: [
      {
        name: "History of Brava",
        href: "/history",
        icon: BookOpen,
        description: "The island's rich past",
      },
      {
        name: "Historical Figures",
        href: "/people",
        icon: Users,
        description: "People who shaped Brava",
      },
    ],
  },
  ...resolve(["settlements", "photographs", "films", "map"]).map((d) => ({
    name: d.label,
    href: d.href,
  })),
];

export const languages = [
  { code: "EN", label: "English", flag: "🇺🇸", disabled: false },
  { code: "PT", label: "Português", flag: "🇵🇹", disabled: true },
  { code: "CV", label: "Kriolu", flag: "🇨🇻", disabled: true },
];
