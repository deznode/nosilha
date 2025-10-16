import React from "react";
import Link from "next/link";
import { SocialMediaLinks } from "@/components/ui/social-media-links";
// Data for the footer links, based on the proposed structure.
const navigation = {
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
    /* TODO: Enable when photo galleries feature is ready
    { name: "Photo Galleries", href: "/media/photos" },
    */
  ].filter(Boolean), // Remove any undefined entries
  connect: [
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "Contribute", href: "/contribute" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer
      className="bg-background-secondary text-text-secondary"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 lg:py-32">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Explore Brava */}
          <div>
            <h3 className="text-text-primary text-base leading-6 font-semibold">
              Explore Brava
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
              Culture & History
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
              Connect
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

          {/* Column 4: Newsletter */}
          <div className="mt-10 lg:mt-0">
            <h3 className="text-text-primary text-base leading-6 font-semibold">
              Subscribe to our newsletter
            </h3>
            <p className="mt-2 text-sm leading-6">
              The latest news, articles, and resources, sent to your inbox
              weekly.
            </p>
            <form className="mt-6 sm:flex sm:max-w-md">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email-address"
                type="email"
                required
                placeholder="Enter your email"
                autoComplete="email"
                className="bg-background-primary text-text-primary ring-border-primary placeholder:text-text-tertiary focus:ring-ocean-blue w-full min-w-0 appearance-none rounded-md border-0 px-3 py-1.5 text-base shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:w-64 sm:text-sm sm:leading-6 xl:w-full"
              />
              <div className="mt-4 sm:mt-0 sm:ml-4 sm:shrink-0">
                <button
                  type="submit"
                  className="bg-ocean-blue hover:bg-ocean-blue/90 focus-visible:outline-ocean-blue flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-border-primary mt-16 border-t pt-8 sm:mt-20 md:flex md:items-center md:justify-between lg:mt-24">
          <SocialMediaLinks variant="compact" className="md:order-2" />
          <p className="text-text-tertiary mt-8 text-xs leading-5 md:order-1 md:mt-0">
            &copy; {new Date().getFullYear()} Nosilha.com. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
