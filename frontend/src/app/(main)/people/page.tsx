import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { articles } from "@/.velite";

// Enable ISR with 2 hour revalidation for people content
export const revalidate = 7200;

export default function PeoplePage() {
  // Filter to people category, English only
  const peopleArticles = articles
    .filter((a) => a.category === "people" && a.language === "en")
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

        {peopleArticles.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-text-secondary">
              No articles published yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {peopleArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/people/${article.slug}`}
                className="block overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800"
              >
                <div className="p-4">
                  <span className="text-text-secondary text-xs">
                    {new Date(article.publishDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <h3 className="font-merriweather text-text-primary mt-2 line-clamp-2 font-semibold dark:text-white">
                    {article.title}
                  </h3>
                  <p className="text-text-secondary mt-2 line-clamp-3 text-sm">
                    {article.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
