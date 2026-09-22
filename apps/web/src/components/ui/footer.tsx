import clsx from "clsx";
import Link from "next/link";

import { FooterNewsletterForm } from "@/components/newsletter/footer-newsletter-form";
import { FOOTER_LEGAL_DESTINATIONS } from "@/components/navigation/nav-config";
import { NosilhaLogo } from "@/components/ui/logo";
import { SocialMediaLinks } from "@/components/ui/social-media-links";

// Module-level constant for copyright year (evaluated once at module load)
const COPYRIGHT_YEAR = new Date().getFullYear();

export interface FooterProps {
  className?: string;
}

/**
 * The colophon: what this is, who made it, how to subscribe, the legal line.
 *
 * Not a second navigation. The More sheet carries the destinations below 1024 and
 * the desktop bar carries them above it, so the two link columns this footer used
 * to have were a third copy of the same list — they are gone (FR-007).
 *
 * Dark in both themes, and every colour here comes from the scoped `--footer-*`
 * group. There is deliberately **no `dark:` variant anywhere in this file**: the
 * footer does not flip with the theme, so a theme-reactive token would resolve to
 * its light value on a permanently dark ground. That is exactly how the shipped
 * footer ended up with a 2.18:1 privacy line in light mode and a 2.27:1 Subscribe
 * button in dark. Anything dropped in here later must read from `--footer-*` or
 * `--accent-on-dark` rather than reaching for a page token. Spec 037 FR-009.
 */
export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={clsx(
        "bg-footer-ground text-footer-body",
        // The bottom bar is fixed over the end of the page, and the footer sits
        // outside <main>, so it gets none of <main>'s clearance. Without this the
        // copyright line sits under the bar. Keeping the clearance inside the
        // footer's own ground also means the bar always has the footer behind it
        // at the end of a page, never page content. Phone only — the utility reads
        // `--chrome-bottom-bar-height`, which is 0 from 768 up. (FR-007, FR-008)
        "chrome-bottom-clearance",
        className
      )}
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      {/* The footer's only edge treatment. In light mode it declares the boundary
          between paper page and dark footer, where a 1px border reads as an
          accident; in dark mode the footer and the page are the same ground and
          this is the only thing separating them. */}
      <div
        className="h-[3px] w-full bg-[linear-gradient(90deg,var(--accent-on-dark),var(--accent-on-dark-deep))]"
        aria-hidden="true"
      />

      <div className="px-[18px] pt-5 pb-4 md:px-7 md:pt-[30px] md:pb-6">
        <div className="mx-auto max-w-7xl md:flex md:items-start md:justify-between md:gap-8">
          <div className="md:max-w-md">
            <div className="mb-[9px] flex items-center">
              <NosilhaLogo
                variant="light"
                size="sidebar"
                showSubtitle={false}
                instanceId="footer-logo"
              />
            </div>
            <p className="text-footer-body text-[13px] leading-[1.55]">
              Nos terra, nos gente, nos memoria.
            </p>
            <p className="text-footer-muted mt-2 hidden text-[13px] leading-[1.55] md:block">
              Get updates on new stories, cultural events, and ways to
              contribute.
            </p>
          </div>

          <div className="mt-[13px] md:mt-0 md:w-[302px] md:shrink-0">
            <FooterNewsletterForm />
          </div>
        </div>
      </div>

      <div className="border-footer-divider border-t px-[18px] pt-1.5 pb-3 md:px-7">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-[14px]">
          {FOOTER_LEGAL_DESTINATIONS.map((destination) => (
            <Link
              key={destination.key}
              href={destination.href}
              className="text-footer-body hover:text-footer-heading py-2.5 text-[13px] transition-colors duration-150"
            >
              {destination.label}
            </Link>
          ))}
          <SocialMediaLinks
            variant="compact"
            tone="onDark"
            className="ml-auto"
          />
          <p className="text-footer-muted mt-0.5 w-full text-xs">
            &copy; {COPYRIGHT_YEAR} Nos Ilha. Open Source Cultural Heritage
            Project.
          </p>
        </div>
      </div>
    </footer>
  );
}
