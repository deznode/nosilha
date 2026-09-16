/**
 * The static shell of an archive screen. Spec 034 Wave 5.
 *
 * Cache Components prerenders everything above a `<Suspense>` boundary; reading
 * `params` or `searchParams` below one is what lets the rest of the page ship as a
 * static shell instead of blocking on a request. This is what fills the hole for the
 * moment before the real screen streams in — a page-shaped block, not a spinner, so
 * the layout does not jump when the content lands.
 */
export function ArchiveSkeleton({
  full = false,
}: {
  /** For the screens that fill the viewport rather than scrolling. */
  full?: boolean;
}) {
  return (
    <div
      aria-hidden
      style={{
        maxWidth: full ? undefined : "1180px",
        margin: "0 auto",
        padding: "40px 22px 80px",
        minHeight: full ? "calc(100vh - 65px)" : undefined,
      }}
    >
      <div
        className="animate-pulse rounded-xl"
        style={{
          height: "44px",
          width: "min(320px, 70%)",
          background: "var(--muted)",
        }}
      />
      <div
        className="animate-pulse rounded-lg"
        style={{
          height: "16px",
          width: "min(560px, 90%)",
          marginTop: "18px",
          background: "var(--muted)",
        }}
      />
    </div>
  );
}
