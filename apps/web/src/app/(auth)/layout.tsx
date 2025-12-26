/**
 * Auth Layout - Full-Page Takeover
 *
 * This layout excludes the Header and Footer components to provide
 * a distraction-free, full-page authentication experience following
 * UX best practices for auth flows.
 *
 * The auth-form.tsx component handles its own min-h-screen layout
 * with the split-screen brand panel + form design.
 *
 * Providers (QueryProvider, AuthProvider, ToastProvider) are inherited
 * from the root layout.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
