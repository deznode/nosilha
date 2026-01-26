"use client";

import Link from "next/link";
import clsx from "clsx";
import { SocialMediaLinks } from "@/components/ui/social-media-links";
import { NosilhaLogo } from "@/components/ui/logo";
import { FooterNewsletterForm } from "@/components/newsletter/footer-newsletter-form";

// Navigation links - Ideate-style grouping
const defaultNavigation = {
  community: [
    { name: "Stories", href: "/stories" },
    { name: "Directory", href: "/directory" },
    { name: "Media Gallery", href: "/gallery" },
    { name: "Share a Memory", href: "/contribute/story" },
  ],
  legal: [
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

type NavigationConfig = typeof defaultNavigation;

interface FooterCopy {
  tagline: string;
  communityHeading: string;
  legalHeading: string;
  newsletterHeading: string;
  copyright: string;
}

const defaultCopy: FooterCopy = {
  tagline: "Nos terra, nos gente, nos memoria.",
  communityHeading: "Community",
  legalHeading: "Legal & About",
  newsletterHeading: "Stay Connected",
  copyright: "Open Source Cultural Heritage Project.",
};

export interface FooterProps {
  className?: string;
  navigation?: NavigationConfig;
  copy?: Partial<FooterCopy>;
}

export function Footer({
  className,
  navigation = defaultNavigation,
  copy: copyOverrides,
}: FooterProps = {}) {
  const copy = { ...defaultCopy, ...copyOverrides } satisfies FooterCopy;

  return (
    <footer
      className={clsx("bg-basalt-900 text-muted", className)}
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
        {/* Top section: 3-column grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Column 1: Brand + Tagline */}
          <div>
            <NosilhaLogo variant="light" size="compact" showSubtitle={false} />
            <p className="mt-4 text-sm leading-6">{copy.tagline}</p>
          </div>

          {/* Column 2: Community */}
          <div>
            <h3 className="text-base leading-6 font-semibold text-white">
              {copy.communityHeading}
            </h3>
            <ul role="list" className="mt-4 space-y-3">
              {navigation.community.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm leading-6 transition-colors hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal & About */}
          <div>
            <h3 className="text-base leading-6 font-semibold text-white">
              {copy.legalHeading}
            </h3>
            <ul role="list" className="mt-4 space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm leading-6 transition-colors hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 border-t border-basalt-800 pt-8">
          <div className="md:flex md:items-start md:justify-between">
            <div className="max-w-md">
              <h3 className="text-base leading-6 font-semibold text-white">
                {copy.newsletterHeading}
              </h3>
              <p className="mt-2 text-sm leading-6">
                Get updates on new stories, cultural events, and ways to
                contribute.
              </p>
            </div>
            <div className="mt-4 md:mt-0 md:ml-8 md:flex-shrink-0">
              <FooterNewsletterForm />
            </div>
          </div>
        </div>

        {/* Bottom Bar: Social + Copyright */}
        <div className="mt-12 border-t border-basalt-800 pt-8 md:flex md:items-center md:justify-between">
          <SocialMediaLinks variant="compact" className="md:order-2" />
          <p className="mt-8 text-xs leading-5 text-muted md:order-1 md:mt-0">
            &copy; {new Date().getFullYear()} Nos Ilha. {copy.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
