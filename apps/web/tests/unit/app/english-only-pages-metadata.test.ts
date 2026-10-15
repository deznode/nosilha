import { afterEach, describe, expect, it, vi } from "vitest";

const intl = vi.hoisted(() => ({ locale: "en" as "en" | "pt-PT" }));

// Portuguese switched on, so a page with a Portuguese version would declare
// alternates; these four must not.
vi.mock("@/i18n/config", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/i18n/config")>()),
  PORTUGUESE_ENABLED: true,
}));

// The titles are not under test; English messages serve both locales.
vi.mock("next-intl/server", async () => {
  const { createTranslator } = await import("next-intl");
  const { default: messages } = await import("../../../messages/en.json");
  return {
    getLocale: async () => intl.locale,
    getTranslations: async (namespace?: string) =>
      createTranslator({ locale: "en", messages, namespace } as never),
  };
});

import { siteConfig } from "@/lib/metadata";
import { generateMetadata as privacyMetadata } from "@/app/[locale]/(main)/privacy/page";
import { generateMetadata as termsMetadata } from "@/app/[locale]/(main)/terms/page";
import { generateMetadata as profileMetadata } from "@/app/[locale]/(main)/profile/layout";
import { generateMetadata as settingsMetadata } from "@/app/[locale]/(main)/settings/layout";

const pages = [
  ["/privacy", privacyMetadata],
  ["/terms", termsMetadata],
  ["/profile", profileMetadata],
  ["/settings", settingsMetadata],
] as const;

/** Spec 041 FR-006, FR-008 — English-only pages declare no language alternates. */
describe.each(pages)("%s metadata", (path, generateMetadata) => {
  afterEach(() => {
    intl.locale = "en";
  });

  it("is canonical at its English address, with no alternates", async () => {
    const metadata = await generateMetadata();
    expect(metadata.alternates).toEqual({
      canonical: `${siteConfig.url}${path}`,
    });
  });

  it("is canonical at its /pt address, with no alternates", async () => {
    intl.locale = "pt-PT";
    const metadata = await generateMetadata();
    expect(metadata.alternates).toEqual({
      canonical: `${siteConfig.url}/pt${path}`,
    });
  });
});
