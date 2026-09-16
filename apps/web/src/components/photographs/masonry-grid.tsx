/**
 * The masonry. Spec 034 FR-009.
 *
 * CSS columns rather than a JS layout: with every tile reserving its stored aspect
 * ratio, the browser can place the whole grid on first paint with no measuring pass
 * and no shift when the images arrive.
 */
export function MasonryGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ columnWidth: "300px", columnGap: "16px" }}>{children}</div>
  );
}
