import type { Metadata } from "next";
import clsx from "clsx";
import { NextIntlClientProvider } from "next-intl";

import { AdminShell } from "@/components/admin/layout";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { ThemeSync } from "@/components/theme-sync";
import { siteConfig } from "@/lib/metadata";
import { buildThemeInitScript } from "@/lib/theme/initial-theme";
import { fraunces, outfit } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    template: "%s | Nos Ilha",
    default: siteConfig.title,
  },
};

/**
 * Admin Layout - Dedicated admin shell with sidebar navigation
 *
 * This layout wraps all routes in the (admin) route group
 * with the AdminShell (sidebar + top bar + content area).
 *
 * It is a root layout of its own: the public site's root layout sits under
 * `[locale]`, and the admin area is English only and unprefixed (spec 041). Moving
 * between admin and public pages is therefore a full page load.
 *
 * Authentication is handled by proxy.ts at the edge,
 * so this layout can be a simple Server Component.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Same pre-paint theme rule as the public root layout. */}
        <script dangerouslySetInnerHTML={{ __html: buildThemeInitScript() }} />
      </head>
      <body
        className={clsx(
          "bg-background-primary min-h-screen font-sans antialiased transition-all duration-300 ease-in-out",
          outfit.variable,
          fraunces.variable
        )}
      >
        <ThemeSync />
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              {/* Shared components link through `@/i18n/navigation`, which needs
                  a locale in context. Here it is always English. */}
              <NextIntlClientProvider locale="en" messages={null}>
                <AdminShell>{children}</AdminShell>
              </NextIntlClientProvider>
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
