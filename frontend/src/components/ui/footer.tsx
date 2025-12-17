import React from "react";
import Link from "next/link";
import clsx from "clsx";
import { SocialMediaLinks } from "@/components/ui/social-media-links";
// Data for the footer links, based on the proposed structure.
const defaultNavigation = {
  explore: [
    { name: "Interactive Map", href: "/map" },
    /* TODO: Enable when towns & villages feature is ready
    { name: "Towns & Villages", href: "/towns" },
    */
    { name: "Restaurants & Cafes", href: "/directory/restaurant" },
    { name: "Landmarks", href: "/directory/landmark" },
    { name: "Beaches & Bays", href: "/directory/beach" },
  ].filter(Boolean), // Remove any undefined entries
  culture: [
    { name: "History of Brava", href: "/history" },
    { name: "Historical Figures", href: "/people" },
  ].filter(Boolean), // Remove any undefined entries
  connect: [
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "Contribute", href: "/contribute" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

type NavigationConfig = typeof defaultNavigation;

interface FooterCopy {
  exploreHeading: string;
  cultureHeading: string;
  connectHeading: string;
  legal: string;
}

const defaultCopy: FooterCopy = {
  exploreHeading: "Explore Brava",
  cultureHeading: "Culture & History",
  connectHeading: "Connect",
  legal: "All rights reserved.",
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
      className={clsx("bg-background-secondary text-text-secondary", className)}
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 lg:py-32">
        {/* Newsletter form removed - consolidated to NewsletterCtaSection above footer */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Column 1: Explore Brava */}
          <div>
            <h3 className="text-text-primary text-base leading-6 font-semibold">
              {copy.exploreHeading}
            </h3>
            <ul role="list" className="mt-6 space-y-4">
              {navigation.explore.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="hover:text-text-primary text-sm leading-6"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Culture & History */}
          <div>
            <h3 className="text-text-primary text-base leading-6 font-semibold">
              {copy.cultureHeading}
            </h3>
            <ul role="list" className="mt-6 space-y-4">
              {navigation.culture.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="hover:text-text-primary text-sm leading-6"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Connect */}
          <div>
            <h3 className="text-text-primary text-base leading-6 font-semibold">
              {copy.connectHeading}
            </h3>
            <ul role="list" className="mt-6 space-y-4">
              {navigation.connect.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="hover:text-text-primary text-sm leading-6"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-border-primary mt-16 border-t pt-8 sm:mt-20 md:flex md:items-center md:justify-between lg:mt-24">
          <SocialMediaLinks variant="compact" className="md:order-2" />
          <p className="text-text-tertiary mt-8 text-xs leading-5 md:order-1 md:mt-0">
            &copy; {new Date().getFullYear()} Nosilha.com. {copy.legal}
          </p>
        </div>
      </div>
    </footer>
  );
}
