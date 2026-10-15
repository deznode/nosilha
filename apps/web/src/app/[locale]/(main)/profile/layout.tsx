import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

import { withLocaleMetadata } from "@/lib/metadata";

/**
 * The page is a client component, so its metadata lives here. Its body stays English
 * (spec 041 FR-006), so it declares no language alternates (FR-008).
 */
export async function generateMetadata(): Promise<Metadata> {
  return withLocaleMetadata(
    {},
    { path: "/profile", locale: await getLocale(), hasPortuguese: false }
  );
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
