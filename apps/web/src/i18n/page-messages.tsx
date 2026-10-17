import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { pickMessages } from "./client-messages";

/**
 * Sends one page's client messages to the browser, so the root layout doesn't have
 * to send every page's.
 *
 * Inside it, these messages replace the root provider's, so `namespaces` lists every
 * path the page's client components read, including ones the root also sends.
 * Locale, time zone and formats still come from the request config.
 * `tests/unit/i18n/client-messages.test.ts` checks the list against the page.
 *
 * A server component: a page that is a client component gets it from a `layout.tsx`
 * in its own folder.
 */
export async function PageMessages({
  namespaces,
  children,
}: {
  namespaces: readonly string[];
  children: ReactNode;
}) {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={pickMessages(messages, namespaces)}>
      {children}
    </NextIntlClientProvider>
  );
}
