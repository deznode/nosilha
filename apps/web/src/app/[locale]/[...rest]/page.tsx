import { notFound } from "next/navigation";

/**
 * Catches every address no other route matches, so it renders `not-found.tsx`
 * inside the site's layout and in the page's language.
 *
 * Without it there is nothing to render: the root layout sits under `[locale]`, so
 * an unmatched address belongs to no root layout and Next answers with a bare 404
 * document. The alternative, `global-not-found.tsx`, is experimental, renders
 * outside every layout, and can only be written in one language.
 */
export default function CatchAllPage() {
  notFound();
}
