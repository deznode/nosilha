import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";

import { PageMessages } from "@/i18n/page-messages";
import { FilmsCinema } from "@/components/films/cinema/films-cinema";
import { getGalleryMedia, getTownStatusSummary } from "@/lib/api";
import { FILMS_FETCH_SIZE, canPlay, pickFeatured, toFilms } from "@/lib/films";
import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.films");
  return generatePageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/films",
    locale: await getLocale(),
    keywords: [
      "Brava Island films",
      "Cape Verde video archive",
      "Brava Island video",
      "Cape Verdean films",
    ],
  });
}

/** Spec 038 FR-030 to FR-032. */
export default async function FilmsPage() {
  "use cache";
  cacheLife("content");
  cacheTag("gallery");
  cacheTag("towns");

  // No `catch` on the films: a swallowed failure would be cached as "None in the
  // archive yet" for an hour. The settlements only name places, so they may fail.
  const [page, settlements] = await Promise.all([
    getGalleryMedia({ mediaType: "VIDEO", size: FILMS_FETCH_SIZE }),
    getTownStatusSummary().catch(() => []),
  ]);
  const [t, locale] = await Promise.all([
    getTranslations("films"),
    getLocale(),
  ]);
  const films = toFilms(page.items, settlements, t);

  // The hero plays on arrival, so it must be a film that can; with none, no hero.
  const featured =
    pickFeatured(films.filter(canPlay), locale) ?? pickFeatured(films, locale);

  return (
    <PageMessages namespaces={["films"]}>
      <FilmsCinema films={films} featured={featured} />
    </PageMessages>
  );
}
