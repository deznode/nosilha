import { AdminShell } from "@/components/admin/layout";

/**
 * Admin Layout - Dedicated admin shell with sidebar navigation
 *
 * This layout wraps all routes in the (admin) route group
 * with the AdminShell (sidebar + top bar + content area).
 *
 * Authentication is handled by proxy.ts at the edge,
 * so this layout can be a simple Server Component.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
