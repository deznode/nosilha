/**
 * Immersive Layout - Full-screen pages without site chrome
 *
 * This layout wraps routes that need a full-page takeover (e.g. map).
 * No Header, Footer, or MobileBottomNav — the page provides its own navigation.
 */
export default function ImmersiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main id="main-content">{children}</main>;
}
