import type { Metadata } from "next";
import { cacheLife } from "next/cache";

import { ContributeLanding } from "@/features/contribute/components/contribute-landing";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Give to the Archive",
  description:
    "Give a photograph or a film link of Brava Island to the Nos Ilha archive. You keep the copyright — we record who took it and who gave it.",
  path: "/contribute",
  keywords: [
    "contribute to Nos Ilha",
    "give a photograph of Brava",
    "share Brava Island photos",
    "Cape Verde archive contribution",
  ],
});

/** `/contribute` (E1). Spec 039 entry points. */
export default async function ContributePage() {
  "use cache";
  cacheLife("max");
  return <ContributeLanding />;
}
