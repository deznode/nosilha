import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PageMessages } from "@/i18n/page-messages";
import { withLocaleMetadata } from "@/lib/metadata";
import { AddDirectoryEntryForm } from "@/components/directory";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.contributeDirectory");
  return withLocaleMetadata(
    {
      title: t("title"),
      description: t("description"),
    },
    {
      path: "/contribute/directory",
      locale: await getLocale(),
    }
  );
}

export default function ContributeDirectoryPage() {
  return (
    <PageMessages
      namespaces={[
        "auth.inlinePrompt",
        "common",
        "contribute.directory",
        "photographs",
        "validation",
      ]}
    >
      <AddDirectoryEntryForm />
    </PageMessages>
  );
}
