import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";

import { ContributeLanding } from "@/features/contribute/components/contribute-landing";
import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.contribute");
  return generatePageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/contribute",
    locale: await getLocale(),
    keywords: [
      "contribute to Nos Ilha",
      "give a photograph of Brava",
      "share Brava Island photos",
      "Cape Verde archive contribution",
    ],
  });
}

/** `/contribute` (E1). Spec 039 entry points. */
export default async function ContributePage() {
  "use cache";
  cacheLife("max");
  return <ContributeLanding />;
}
