import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { withLocaleMetadata } from "@/lib/metadata";
import { AddDirectoryEntryForm } from "@/components/directory";

export async function generateMetadata(): Promise<Metadata> {
  return withLocaleMetadata(
    {
      title: "Add Directory Entry | Nos Ilha",
      description:
        "Help us document Brava Island's cultural heritage by adding a new location to our directory.",
    },
    {
      path: "/contribute/directory",
      locale: await getLocale(),
    }
  );
}

export default function ContributeDirectoryPage() {
  return <AddDirectoryEntryForm />;
}
