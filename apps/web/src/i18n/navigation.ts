import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Locale-aware navigation. Public code imports `Link`, `useRouter`, `usePathname` and
 * `redirect` from here, never from `next/link` or `next/navigation` (ESLint enforces
 * it): these keep a visitor under `/pt` and hand back paths without the prefix.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
