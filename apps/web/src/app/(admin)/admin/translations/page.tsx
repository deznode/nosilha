import { TranslationDashboard } from "@/components/content/translation-dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { pages } from "@/.velite";
import { type Language } from "@/lib/content/translations";

export const revalidate = 3600;

export default function TranslationsPage() {
  // Transform pages for the dashboard
  const pageData = pages.map((page) => ({
    slug: page.slug,
    category: page.category,
    title: page.title,
    language: page.language as Language,
    publishDate: page.publishDate,
    updatedDate: page.updatedDate,
    sourceHash: page.sourceHash,
  }));

  return (
    <div className="bg-mist-50 dark:bg-basalt-900 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Translation Dashboard"
          subtitle="Manage and track translations across all content"
        />

        <div className="mt-8">
          <TranslationDashboard articles={pageData} />
        </div>
      </div>
    </div>
  );
}

export function generateMetadata() {
  return {
    title: "Translation Dashboard | Admin | Nos Ilha",
    description: "Manage and track content translations",
  };
}
