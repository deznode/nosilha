"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardGrid } from "@/components/content/card";
import { Language } from "@/lib/content/translations";

export interface RelatedArticleData {
  slug: string;
  title: string;
  description: string;
  coverImage?: string;
  category: string;
  language: string;
}

interface RelatedArticlesProps {
  articles: RelatedArticleData[];
  currentLanguage: Language;
}

export function RelatedArticles({
  articles,
  currentLanguage,
}: RelatedArticlesProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div className="border-border-primary mt-12 border-t pt-12">
      <h3 className="text-text-primary mb-6 text-2xl font-bold">
        Related Articles
      </h3>
      <CardGrid columns={3}>
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/${article.category}/${article.slug}?lang=${currentLanguage}`}
            className="group block h-full"
          >
            <Card className="h-full transition-transform hover:-translate-y-1 hover:shadow-md">
              {article.coverImage && (
                <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-md">
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <h4 className="text-text-primary group-hover:text-brand-primary mb-2 text-lg font-semibold">
                {article.title}
              </h4>
              <p className="text-text-secondary line-clamp-2 text-sm">
                {article.description}
              </p>
            </Card>
          </Link>
        ))}
      </CardGrid>
    </div>
  );
}
