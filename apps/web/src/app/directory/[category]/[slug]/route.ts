import { NextRequest, NextResponse } from "next/server";

import { getEntryBySlug, getTownStatusSummary } from "@/lib/api";
import { placeRecordPath } from "@/lib/place-path";

/** Entry slugs are lowercase words and hyphens; anything else is not looked up. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

/**
 * Moves a pre-archive record address to the record's page. Spec 034 FR-015.
 *
 * Serves `/directory/:category/:slug` and, because `entry` fills the category
 * segment, the older `/directory/entry/:slug`. The category is ignored: the slug
 * alone identifies the record, and the settlement comes from the record.
 *
 * A record that resolves moves permanently (308). One that does not — unknown, owned
 * by no settlement, or a failed lookup — goes to the settlements temporarily (307),
 * so a record added or repaired later can still take over its old address.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string; slug: string }> }
) {
  const { slug } = await params;
  const fallback = NextResponse.redirect(
    new URL("/settlements", request.url),
    307
  );
  if (!SLUG_PATTERN.test(slug)) return fallback;

  try {
    const [entry, towns] = await Promise.all([
      getEntryBySlug(slug),
      getTownStatusSummary(),
    ]);
    const path = entry ? placeRecordPath(entry, towns) : null;
    if (!path) return fallback;

    return NextResponse.redirect(new URL(path, request.url), 308);
  } catch (error) {
    console.error(`Could not resolve legacy entry address "${slug}":`, error);
    return fallback;
  }
}
