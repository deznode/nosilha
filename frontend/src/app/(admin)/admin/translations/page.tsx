import { TranslationDashboard } from "@/components/content/translation-dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { articles } from "@/.velite";
import { type Language } from "@/lib/content/translations";

export const revalidate = 3600;

export default function TranslationsPage() {
  // Transform articles for the dashboard
  const articleData = articles.map((article) => ({
    slug: article.slug,
    category: article.category,
    title: article.title,
    language: article.language as Language,
    publishDate: article.publishDate,
    updatedDate: article.updatedDate,
    sourceHash: article.sourceHash,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Translation Dashboard"
          subtitle="Manage and track translations across all content"
        />

        <div className="mt-8">
          <TranslationDashboard articles={articleData} />
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
