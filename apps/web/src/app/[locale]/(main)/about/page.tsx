import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PageMessages } from "@/i18n/page-messages";
import { withLocaleMetadata } from "@/lib/metadata";
import { cacheLife } from "next/cache";
import { AboutPageContent } from "@/components/pages/about-page-content";

export default async function AboutPage() {
  "use cache";
  cacheLife("max");
  return (
    <PageMessages namespaces={["about"]}>
      <AboutPageContent />
    </PageMessages>
  );
}

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.about");
  return withLocaleMetadata(
    {
      title: t("title"),
      description: t("description"),
      openGraph: {
        title: t("ogTitle"),
        description: t("ogDescription"),
        images: ["/images/about/community-collaboration.jpg"],
      },
    },
    {
      path: "/about",
      locale: await getLocale(),
    }
  );
}
