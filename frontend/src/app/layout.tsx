import type { Metadata } from "next";
import { Lato, Merriweather } from "next/font/google";
import clsx from "clsx";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Suspense } from "react";

import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import {
  siteConfig,
  generateOrganizationSchema,
  createStructuredDataScript,
} from "@/lib/metadata";
import { AnalyticsListener } from "./analytics-listener";
import { reportWebVitalsToGA } from "./web-vitals";
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

// Analytics configuration
const GA_ID = process.env.NEXT_PUBLIC_GA_ID!;
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Generate organization structured data
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang="en" suppressHydrationWarning>
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
        <a
          href="#main-content"
          className="focus:bg-background-primary focus:text-text-primary focus:ring-ocean-blue sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          Skip to main content
        </a>
        <Suspense fallback={null}>
          <AnalyticsListener />
        </Suspense>
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              <div className="flex min-h-screen flex-col">
                {/* 3. Render the global Header, main content, and Footer */}
                <Header className="print:hidden" />
                <main id="main-content" className="animate-fade-in flex-grow">
                  {children}
                </main>
                <div className="print:hidden">
                  <Footer />
                </div>
              </div>
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>

        {/* Google Analytics 4 - Optimized loading */}
        <GoogleAnalytics gaId={GA_ID} />

        {/* Microsoft Clarity - Session replay and heatmaps */}
        {CLARITY_PROJECT_ID && (
          <Script
            id="microsoft-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}

/**
 * Web Vitals Reporting
 *
 * Next.js automatically calls this function with Core Web Vitals metrics.
 * We send these metrics to Google Analytics 4 for performance monitoring.
 *
 * @see https://nextjs.org/docs/app/guides/analytics
 */
export function reportWebVitals(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metric: any
) {
  reportWebVitalsToGA(metric);
}
