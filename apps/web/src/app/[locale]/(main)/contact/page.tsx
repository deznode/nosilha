import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PageMessages } from "@/i18n/page-messages";
import { withLocaleMetadata } from "@/lib/metadata";
import { cacheLife } from "next/cache";
import { ContactPageContent } from "@/components/pages/contact-page-content";

export default async function ContactPage() {
  "use cache";
  cacheLife("max");
  return (
    <PageMessages namespaces={["common", "contact"]}>
      <ContactPageContent />
    </PageMessages>
  );
}

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.contact");
  return withLocaleMetadata(
    {
      title: t("title"),
      description: t("description"),
      openGraph: {
        title: t("ogTitle"),
        description: t("ogDescription"),
        images: ["/images/contact/contact-hero.jpg"],
      },
    },
    {
      path: "/contact",
      locale: await getLocale(),
    }
  );
}
