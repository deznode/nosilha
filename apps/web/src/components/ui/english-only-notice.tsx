import { clsx } from "clsx";
import { useLocale, useTranslations } from "next-intl";

import { DEFAULT_LOCALE } from "@/i18n/config";

/**
 * One line, in the page's language, saying the body below is English only. Spec 041
 * FR-006: privacy and terms keep their English text under `/pt`.
 *
 * Renders nothing on English pages. Shared like `RecordText`: `useLocale` and
 * `useTranslations` work in non-async server components and in client components.
 */
export function EnglishOnlyNotice({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("common");
  if (locale === DEFAULT_LOCALE) return null;

  return (
    <p
      className={clsx(
        "bg-surface border-hairline text-muted rounded-card border px-4 py-3 text-sm",
        className
      )}
    >
      {t("englishOnly")}
    </p>
  );
}
