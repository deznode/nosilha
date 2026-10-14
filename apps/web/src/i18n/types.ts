import type { useTranslations } from "next-intl";

/** Every namespace and nested namespace in `messages/en.json`. */
export type Namespace = NonNullable<Parameters<typeof useTranslations>[0]>;

/**
 * A translator bound to one namespace. Copy modules take one of these, so the same
 * function serves server callers (`getTranslations`) and client callers
 * (`useTranslations`).
 */
export type Translator<N extends Namespace> = ReturnType<
  typeof useTranslations<N>
>;
