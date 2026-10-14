import { cacheLife } from "next/cache";
import { PageHeader } from "@/components/ui/page-header";
import { pages } from "@/.velite";
import { PeopleGrid } from "@/components/pages/people-grid";

export default async function PeoplePage() {
  "use cache";
  cacheLife("longLived");
  // Filter to people category, English only, exclude drafts
  const peoplePages = pages
    .filter((p) => p.category === "people" && p.language === "en" && !p.draft)
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );

  return (
    <div className="bg-background-secondary min-h-screen font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
        <PageHeader
          title="Historical Figures"
          subtitle="The remarkable individuals who shaped Brava's cultural heritage"
          size="compact"
        />

        <PeopleGrid people={peoplePages} />
      </div>
    </div>
  );
}
