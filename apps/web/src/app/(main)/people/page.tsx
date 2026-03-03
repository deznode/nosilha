import { PageHeader } from "@/components/ui/page-header";
import { pages } from "@/.velite";
import { PeopleGrid } from "@/components/pages/people-grid";

// Enable ISR with 2 hour revalidation for people content
export const revalidate = 7200;

export default function PeoplePage() {
  // Filter to people category, English only, exclude drafts
  const peoplePages = pages
    .filter((p) => p.category === "people" && p.language === "en" && !p.draft)
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );

  return (
    <div className="bg-background-secondary min-h-screen font-sans">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Historical Figures"
          subtitle="The remarkable individuals who shaped Brava's cultural heritage"
        />

        <PeopleGrid people={peoplePages} />
      </div>
    </div>
  );
}
