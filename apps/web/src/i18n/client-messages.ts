import type { AbstractIntlMessages } from "next-intl";

/**
 * Which messages reach the browser. Everything else stays on the server.
 *
 * `useTranslations` is the client-side API (server code uses `getTranslations`), so
 * the browser needs exactly the namespaces its client components pass to it. Each
 * list names message paths: a namespace (`"films"`) or a part of one
 * (`"auth.signInDialog"`).
 *
 * The root layout sends what the layouts and the site chrome read. A page that reads
 * more wraps itself in `PageMessages` with its own list, which replaces the root's
 * messages inside the page rather than adding to them. The admin root sends what
 * every admin page reads.
 *
 * `tests/unit/i18n/client-messages.test.ts` compares each list with the
 * `useTranslations` calls reachable from the files it serves.
 */
export const ROOT_MESSAGES = [
  "auth.signInDialog",
  "chrome",
  "common",
  "contribute.newsletter",
  "errors.error",
  "fields",
  "identify",
  "validation",
] as const;

export const ADMIN_MESSAGES = [
  "auth.form",
  "auth.inlinePrompt",
  "chrome",
  "common",
  "contribute.directory",
  "contribute.newsletter",
  "contribute.photoIdentification",
  "entry.related",
  "identify.suggestImprovement",
  "photographs",
  "validation",
] as const;

/** The messages under `paths`, keeping their nesting. Missing paths are skipped. */
export function pickMessages(
  messages: AbstractIntlMessages,
  paths: readonly string[]
): AbstractIntlMessages {
  const picked: AbstractIntlMessages = {};
  for (const path of paths) {
    const keys = path.split(".");
    let source: AbstractIntlMessages | string | undefined = messages;
    for (const key of keys) {
      source =
        source !== null && typeof source === "object" ? source[key] : undefined;
    }
    if (source === undefined) continue;

    let target = picked;
    for (const key of keys.slice(0, -1)) {
      const next = target[key];
      target = (
        typeof next === "object" ? next : (target[key] = {})
      ) as AbstractIntlMessages;
    }
    target[keys[keys.length - 1]] = source;
  }
  return picked;
}
