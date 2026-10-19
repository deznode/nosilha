"use client";

import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";
import type { MouseEvent } from "react";

import {
  LOCALE_COOKIE,
  LOCALE_SEGMENTS,
  PORTUGUESE_ENABLED,
  type Locale,
} from "@/i18n/config";
import { getPathname, usePathname, useRouter } from "@/i18n/navigation";

import { LANGUAGES } from "./nav-config";

/** One year, in seconds: how long an explicit language choice is remembered. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * The address the control opens: the same page, with its query string. Both come
 * without the locale prefix; the router adds the target locale's.
 */
export function languageSwitchTarget(pathname: string, search: string) {
  if (!search || search === "?") return pathname;
  return `${pathname}${search.startsWith("?") ? search : `?${search}`}`;
}

/**
 * The `nosilha-lang` cookie for a choice. It stores the address segment (`en` or
 * `pt`), not the locale tag, and is read only by the proxy, for `/`.
 */
export function languageCookie(locale: Locale, secure = false) {
  return [
    `${LOCALE_COOKIE}=${LOCALE_SEGMENTS[locale]}`,
    `Max-Age=${COOKIE_MAX_AGE}`,
    "Path=/",
    "SameSite=Lax",
    ...(secure ? ["Secure"] : []),
  ].join("; ");
}

/** Writes the choice. Outside the component: it is a side effect of a click. */
function rememberLanguage(locale: Locale) {
  document.cookie = languageCookie(
    locale,
    window.location.protocol === "https:"
  );
}

/**
 * The language control in the site bars. Spec 041 FR-003.
 *
 * Both languages are links, side by side, the current one marked: with two
 * languages a menu adds nothing, and menus are a known source of stuck-open state
 * under `<Activity>`. Each link carries `hrefLang` and names its language in that
 * language.
 *
 * The query string is read from `window.location` when the link is chosen rather
 * than through `useSearchParams`, which would need a Suspense boundary of its own.
 * The rendered `href` is therefore the page without its query, which is what a
 * middle-click opens; a plain click keeps the query.
 *
 * Choosing writes the `nosilha-lang` cookie, so a visitor who chose Portuguese and
 * later opens `/` lands on `/pt`. Arriving on a `/pt` link without using the
 * control sets nothing. Nothing reads the browser's language.
 *
 * While Portuguese is switched off (FR-009) this is the static chip the bars have
 * always shown: the current locale, not a control.
 *
 * `size="compact"` is the desktop bar's version, as tall as the theme pill beside
 * it. Every link is 44px wide and gets a 44px-tall touch area through `hit-area`.
 */
export function LanguageSwitcher(props: LanguageSwitcherProps) {
  if (!PORTUGUESE_ENABLED) return <LanguageChip className={props.className} />;
  return <LanguageLinks {...props} />;
}

type LanguageSwitcherProps = {
  className?: string;
  size?: "block" | "compact";
  /** Called after a choice, e.g. to close the sheet the control sits in. */
  onChoose?: () => void;
};

/** Today's static chip: the current locale, shown but not switchable. */
function LanguageChip({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        "border-hairline text-muted dark:border-chrome-line dark:text-chrome-ink-muted flex h-11 items-center justify-center rounded-lg border font-mono text-[13px]",
        className
      )}
    >
      {LANGUAGES[0].code}
    </span>
  );
}

function LanguageLinks({
  className,
  size = "block",
  onChoose,
}: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("chrome");

  function choose(event: MouseEvent<HTMLAnchorElement>, target: Locale) {
    rememberLanguage(target);
    onChoose?.();

    // A modified click opens a new tab or window from the `href`; leave it be.
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    if (target === locale) return;
    router.push(languageSwitchTarget(pathname, window.location.search), {
      locale: target,
    });
  }

  const compact = size === "compact";

  return (
    <nav
      aria-label={t("language.heading")}
      className={clsx(
        "border-hairline dark:border-chrome-line flex shrink-0 items-stretch border font-mono",
        compact
          ? "rounded-full p-0.5 text-xs"
          : "h-11 rounded-lg p-1 text-[13px]",
        className
      )}
    >
      {LANGUAGES.map((language) => {
        const current = language.locale === locale;
        return (
          <a
            key={language.locale}
            href={getPathname({ href: pathname, locale: language.locale })}
            hrefLang={language.lang}
            lang={language.lang}
            aria-label={language.label}
            aria-current={current ? "true" : undefined}
            onClick={(event) => choose(event, language.locale)}
            className={clsx(
              "focus-ring hit-area flex min-w-11 flex-1 items-center justify-center px-2 transition-colors duration-150",
              compact ? "rounded-full py-[5px]" : "rounded-md",
              current
                ? "bg-surface text-body dark:bg-chrome-line dark:text-chrome-ink"
                : "text-muted hover:text-body dark:text-chrome-ink-muted"
            )}
          >
            {language.code}
          </a>
        );
      })}
    </nav>
  );
}
