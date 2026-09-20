/**
 * Permanent redirects from the pre-archive addresses. Spec 034 FR-015.
 *
 * `next.config.ts` spreads this table into `redirects()`. Next.js applies the first
 * rule that matches, so the hotel listing must come before the catch-all listing.
 * A one-segment `:category` never matches `/directory/:category/:slug`; those
 * addresses reach `app/directory/[category]/[slug]/route.ts`, which looks the record
 * up to find its settlement.
 */
export const LEGACY_REDIRECTS = [
  { source: "/gallery", destination: "/photographs", permanent: true },
  {
    source: "/gallery/photo/:id",
    destination: "/photographs/:id",
    permanent: true,
  },
  { source: "/directory", destination: "/settlements", permanent: true },
  { source: "/directory/hotel", destination: "/stay", permanent: true },
  { source: "/directory/hotels", destination: "/stay", permanent: true },
  {
    source: "/directory/:category",
    destination: "/settlements",
    permanent: true,
  },
] as const;
