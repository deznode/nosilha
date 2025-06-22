import type { Metadata } from "next";
import { Lato, Merriweather } from "next/font/google";
import clsx from "clsx";

import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

// 1. Set up the primary and secondary fonts using next/font/google.
// The 'variable' option creates a CSS variable we can use in our Tailwind theme.
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-merriweather",
});

// 2. Define the base metadata for the site.
// The 'template' will apply a consistent suffix to all child page titles.
export const metadata: Metadata = {
  title: {
    template: "%s | Nosilha.com",
    default: "Nosilha.com | Your Guide to Brava, Cape Verde",
  },
  description:
    "The definitive online tourism and cultural heritage hub for Brava Island, Cape Verde.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={clsx(
          "min-h-screen bg-off-white dark:bg-volcanic-gray-dark font-sans antialiased",
          lato.variable,
          merriweather.variable
        )}
      >
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            {/* 3. Render the global Header, main content, and Footer */}
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
