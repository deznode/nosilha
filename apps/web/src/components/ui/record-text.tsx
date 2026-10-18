import type { ComponentProps, ElementType, JSX } from "react";
import { useLocale } from "next-intl";

import { DEFAULT_LOCALE } from "@/i18n/config";

type RecordTextElement = keyof JSX.IntrinsicElements;

export type RecordTextProps<T extends RecordTextElement = "span"> = {
  /** The element to render. Defaults to `span`. */
  as?: T;
  /**
   * Whether the content is record text. False renders the same element with no
   * `lang`, for slots that show either the record's value or interface text in its
   * place ("Untitled", "Not recorded"), so the element is the same either way.
   */
  when?: boolean;
} & Omit<ComponentProps<T>, "lang">;

/**
 * The `lang` that text kept in English carries on a page in `locale`: `"en"` off
 * English, nothing on English pages, where the document language already says it.
 */
export function recordLang(locale: string): "en" | undefined {
  return locale === DEFAULT_LOCALE ? undefined : "en";
}

/**
 * Text shown as it is stored: record descriptions, captions, town text, and the
 * bodies of the pages that stay in English. Spec 041 FR-005, FR-006.
 *
 * On a Portuguese page it marks its children `lang="en"` for screen readers,
 * hyphenation and translation tools; nothing visible is added. On English pages it
 * adds no attribute at all.
 *
 * No `"use client"` and no `async`: `useLocale` works in server components that are
 * not async and in client components, so one component serves both trees.
 */
export function RecordText<T extends RecordTextElement = "span">({
  as,
  when = true,
  ...props
}: RecordTextProps<T>) {
  const locale = useLocale();
  const Element = (as ?? "span") as ElementType;
  return <Element {...props} lang={when ? recordLang(locale) : undefined} />;
}
