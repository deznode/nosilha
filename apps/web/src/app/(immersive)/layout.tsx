import { Suspense } from "react";

/**
 * Immersive Layout - Full-screen pages without site chrome
 *
 * This layout wraps routes that need a full-page takeover (e.g. map).
 * No Header, Footer, or MobileBottomNav — the page provides its own navigation.
 *
 * The Suspense boundary enables PPR so cached pages (e.g. gallery/photo/[id])
 * can pre-render their static shell while deferring dynamic root providers.
 */
export default function ImmersiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main id="main-content">
      <Suspense>{children}</Suspense>
    </main>
  );
}
