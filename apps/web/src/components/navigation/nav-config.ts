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
  /** Message key in `chrome.header`. */
  nameKey: "historyOfBrava" | "historicalFigures";
  href: string;
  icon: LucideIcon;
  /** Message key in `chrome.header`. */
  descriptionKey: "historyDescription" | "figuresDescription";
};

export type NavItem =
  | {
      key: string;
      labelKey: `nav.${DestinationKey}`;
      href: string;
      type?: "link";
    }
  | {
      key: string;
      labelKey: `nav.${DestinationKey}`;
      type: "dropdown";
      items: DropdownItem[];
    };

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
  /**
   * Message key in the `chrome` namespace, never a label: every surface resolves it
   * in the page's language with `t(destination.labelKey)`. Spec 041 FR-004.
   */
  labelKey: `nav.${DestinationKey}`;
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
    labelKey: "nav.home",
    href: "/",
    icon: Home,
    activeMatch: "exact",
  },
  settlements: {
    key: "settlements",
    labelKey: "nav.settlements",
    href: "/settlements",
    icon: Grid3X3,
    activeMatch: ["/settlements"],
  },
  culture: {
    key: "culture",
    labelKey: "nav.culture",
    href: "/history",
    icon: BookOpen,
    activeMatch: ["/history", "/people"],
  },
  map: {
    key: "map",
    labelKey: "nav.map",
    href: "/map",
    icon: Map,
    activeMatch: "exact",
  },
  photographs: {
    key: "photographs",
    labelKey: "nav.photographs",
    href: "/photographs",
    activeMatch: ["/photographs"],
  },
  films: {
    key: "films",
    labelKey: "nav.films",
    href: "/films",
    activeMatch: ["/films"],
  },
  stay: {
    key: "stay",
    labelKey: "nav.stay",
    href: "/stay",
    activeMatch: ["/stay"],
  },
  about: {
    key: "about",
    labelKey: "nav.about",
    href: "/about",
    activeMatch: "exact",
  },
  contact: {
    key: "contact",
    labelKey: "nav.contact",
    href: "/contact",
    activeMatch: "exact",
  },
  privacy: {
    key: "privacy",
    labelKey: "nav.privacy",
    href: "/privacy",
    activeMatch: "exact",
  },
  terms: {
    key: "terms",
    labelKey: "nav.terms",
    href: "/terms",
    activeMatch: "exact",
  },
};

/** Phone thumb zone. `More` is synthetic and appended by the component. */
const BOTTOM_BAR: DestinationKey[] = ["home", "settlements", "culture", "map"];

/**
 * Shown inline in the 768–1023 bar.
 *
 * If it ever has to shed destinations, the order to drop them in is Culture,
 * Stay, Films, Photographs, Map, Settlements — logo, account and Contribute never
 * collapse. Recorded as prose rather than as an exported array: the bar is
 * specified not to wrap anywhere in 768–1023, so an array would be config nothing
 * reads, kept honest only by a test asserting its own literal.
 */
const TABLET_INLINE: DestinationKey[] = ["settlements", "culture", "map"];

/**
 * The desktop pill bar (≥1024), left to right.
 *
 * `culture` is in this list although the archive bar it restores had no pill for
 * it: every other width reaches `/history` from the chrome (the bottom bar, the
 * tablet bar), so leaving it out would make desktop the one width where a
 * destination is unreachable. One set of destinations is the point of this file.
 */
const DESKTOP_BAR: DestinationKey[] = [
  "home",
  "settlements",
  "culture",
  "photographs",
  "films",
  "map",
  "stay",
];

/** Behind `More ▾` in the 768–1023 bar. */
const TABLET_OVERFLOW: DestinationKey[] = ["photographs", "films", "stay"];

/** The More sheet's grid. Profile / Sign in is auth-conditional, appended by the component. */
const SHEET_DESTINATIONS: DestinationKey[] = [
  "photographs",
  "films",
  "stay",
  "about",
  "contact",
];

/** The footer colophon's legal row. */
const FOOTER_LEGAL: DestinationKey[] = ["about", "contact", "privacy", "terms"];

/** A destination that is guaranteed to carry an icon — see `resolveWithIcons`. */
export type IconDestination = Destination & { icon: LucideIcon };

function resolve(keys: DestinationKey[]): Destination[] {
  return keys.map((key) => DESTINATIONS[key]);
}

/**
 * `resolve` for the one surface that renders icons.
 *
 * The bottom bar's renderer used to assert the icon away (`destination.icon!`)
 * because `icon` is optional on `Destination` — only four destinations have one.
 * Checking here makes the config's guarantee the type's guarantee, and a
 * bottom-bar key added without an icon fails at module load rather than
 * rendering `undefined` as a component.
 */
function resolveWithIcons(keys: DestinationKey[]): IconDestination[] {
  return keys.map((key) => {
    const destination = DESTINATIONS[key];
    if (!destination.icon) {
      throw new Error(`Bottom-bar destination "${key}" is missing an icon.`);
    }
    return destination as IconDestination;
  });
}

/**
 * The key lists above resolved once, at module load.
 *
 * Every one of them is a module constant, so resolving per render rebuilt the
 * same arrays of the same five object references on every navigation, on four
 * surfaces, including server-side for the footer on every page. Resolving here
 * also gives the lists a stable identity, which is what a memoized child would
 * need.
 *
 * These are the file's public surface for membership; the key arrays and
 * `resolve` are private. Exporting both layers gave every list two names, and
 * the only consumer of the key form was a test asserting its own literal.
 */
export const BOTTOM_BAR_DESTINATIONS = resolveWithIcons(BOTTOM_BAR);
export const DESKTOP_BAR_DESTINATIONS = resolve(DESKTOP_BAR);
export const TABLET_INLINE_DESTINATIONS = resolve(TABLET_INLINE);
export const TABLET_OVERFLOW_DESTINATIONS = resolve(TABLET_OVERFLOW);
export const SHEET_DESTINATION_LIST = resolve(SHEET_DESTINATIONS);
export const FOOTER_LEGAL_DESTINATIONS = resolve(FOOTER_LEGAL);

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
  {
    key: "home",
    labelKey: DESTINATIONS.home.labelKey,
    href: DESTINATIONS.home.href,
  },
  {
    key: "culture",
    labelKey: DESTINATIONS.culture.labelKey,
    type: "dropdown",
    items: [
      {
        nameKey: "historyOfBrava",
        href: "/history",
        icon: BookOpen,
        descriptionKey: "historyDescription",
      },
      {
        nameKey: "historicalFigures",
        href: "/people",
        icon: Users,
        descriptionKey: "figuresDescription",
      },
    ],
  },
  ...resolve(["settlements", "photographs", "films", "map"]).map((d) => ({
    key: d.key,
    labelKey: d.labelKey,
    href: d.href,
  })),
];

/**
 * Each language is named in itself (an endonym), so these labels are the same on
 * every page and are not messages. The language control is replaced in spec 041
 * wave 4.
 */
export const languages = [
  { code: "EN", label: "English", flag: "🇺🇸", disabled: false },
  { code: "PT", label: "Português", flag: "🇵🇹", disabled: true },
  { code: "CV", label: "Kriolu", flag: "🇨🇻", disabled: true },
];

/**
 * The locale the chrome shows. One place, because four surfaces were each
 * reaching for `languages[0]` to decide the same thing.
 */
export const currentLanguage = languages[0];
