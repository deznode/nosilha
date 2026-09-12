import type { LucideIcon } from "lucide-react";
import { BookOpen, Users } from "lucide-react";

/**
 * Shared public navigation config.
 *
 * `header` and `sticky-nav` render the same menu at different scroll
 * positions, so they read the same arrays here — adding or descoping a route
 * is one edit instead of one per chrome. `mobile-bottom-nav` keeps its own
 * thumb-zone ordering but shares `languages`.
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

export const navigation: NavItem[] = [
  { name: "Home", href: "/" },
  {
    name: "Culture",
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
  { name: "Directory", href: "/directory" },
  { name: "Media", href: "/gallery" },
  { name: "Map", href: "/map" },
];

export const languages = [
  { code: "EN", label: "English", flag: "🇺🇸", disabled: false },
  { code: "PT", label: "Português", flag: "🇵🇹", disabled: true },
  { code: "CV", label: "Kriolu", flag: "🇨🇻", disabled: true },
];
