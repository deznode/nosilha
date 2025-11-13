import type { Metadata } from "next";
import { Lato, Merriweather } from "next/font/google";
import clsx from "clsx";

import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import Banner from "@/components/ui/banner";
import {
  siteConfig,
  generateOrganizationSchema,
  createStructuredDataScript,
} from "@/lib/metadata";
import "./globals.css";
import "@/styles/print.css";

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

// 2. Define comprehensive metadata for the site with proper metadataBase
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    template: "%s | Nos Ilha",
    default: siteConfig.title,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: "Nos Ilha Team" }],
  creator: "Nos Ilha",
  publisher: "Nos Ilha",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Cultural Heritage Platform for Brava Island, Cape Verde`,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    images: [siteConfig.ogImage],
  },
  alternates: {
    canonical: siteConfig.url,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Generate organization structured data
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang="en">
      <head>
        {/* Theme initialization script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'system';
                  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const shouldBeDark = theme === 'dark' || (theme === 'system' && systemDark);
                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {
                  // Fallback to system preference
                  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                  }
                }
              })();
            `,
          }}
        />
        {/* Organization structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: createStructuredDataScript([organizationSchema]),
          }}
        />
      </head>
      <body
        className={clsx(
          "bg-background-primary min-h-screen font-sans antialiased transition-all duration-300 ease-in-out",
          lato.variable,
          merriweather.variable
        )}
      >
        <QueryProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              {/* 3. Render the global Header, main content, and Footer */}
              <Header className="print:hidden" />
              {/* Cape Verde World Cup 2026 Celebration Banner - Below Header */}
              <div className="sticky top-16 z-50 print:hidden">
                <Banner
                  title="Tubarões Azuis: Mundial 2026!"
                  message="From Brockton to Brava, Boston to Praia - the Blue Sharks made history. Read the inside story of Cape Verde's impossible dream."
                  linkUrl="https://www.bbc.com/sport/football/articles/c04q0gd0yedo"
                />
              </div>
              <main className="animate-fade-in flex-grow">{children}</main>
              <div className="print:hidden">
                <Footer />
              </div>
            </div>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
