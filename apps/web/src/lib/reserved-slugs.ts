/**
 * Segments `/[town]` must refuse. Spec 034 FR-008, FR-015.
 *
 * The settlement route sits at the root of the `(archive)` group, so it competes with
 * every static first segment in the app — `/about`, `/map`, `/photographs` and the
 * rest. Next.js resolves a static segment before a dynamic one, so a collision would
 * not break those pages; it would do something worse, and quieter: `/about` would
 * work, while a settlement genuinely named "about" would silently never be reachable,
 * and `notFound()` is the honest answer for a name the archive cannot address.
 *
 * `tests/unit/lib/reserved-slugs.test.ts` reads `app/` and fails if this list falls
 * behind a route someone adds.
 */
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  "about",
  "admin",
  "api",
  "auth",
  "contact",
  "contribute",
  "design-system",
  "directory",
  "films",
  "gallery",
  "history",
  "login",
  "map",
  "people",
  "photographs",
  "privacy",
  "profile",
  "settings",
  "settlements",
  "signup",
  "stay",
  "stories",
  "terms",
]);

/**
 * Whether this URL segment belongs to the app rather than to a settlement.
 *
 * A blank segment is reserved too: it addresses no settlement, and treating it as a
 * lookup miss would send a database query for the empty string.
 */
export function isReservedSlug(slug: string): boolean {
  const normalised = slug.trim().toLowerCase();
  if (!normalised) return true;
  return RESERVED_SLUGS.has(normalised);
}
