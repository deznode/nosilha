import type { AbstractIntlMessages } from "next-intl";

/**
 * The message namespaces sent to the browser. Everything else stays on the server.
 *
 * A namespace belongs here when any file calls `useTranslations` with it: that hook
 * is the client-side API, and server code uses `getTranslations`. A unit test
 * (`tests/unit/i18n/client-messages.test.ts`) fails when a `useTranslations`
 * namespace is missing from this list.
 */
export const CLIENT_NAMESPACES = [
  "common",
  "chrome",
  "errors",
  "about",
  "contact",
  "map",
  "films",
  "settlements",
  "status",
  "categories",
  "entry",
  "auth",
  "contribute",
  "validation",
  "share",
  "photographs",
  "viewer",
  "identify",
  "fields",
] as const satisfies readonly string[];

export function pickClientMessages(
  messages: AbstractIntlMessages
): AbstractIntlMessages {
  return Object.fromEntries(
    CLIENT_NAMESPACES.filter((namespace) => namespace in messages).map(
      (namespace) => [namespace, messages[namespace]]
    )
  );
}
