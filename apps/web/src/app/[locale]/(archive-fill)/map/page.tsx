"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

function MapLoading() {
  const t = useTranslations("map");
  return (
    <div className="bg-surface-alt flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2
          className="text-brand h-10 w-10 animate-spin"
          aria-hidden="true"
        />
        <p className="text-brand animate-pulse font-serif text-lg font-bold">
          {t("loading")}
        </p>
      </div>
    </div>
  );
}

const BravaMap = dynamic(
  () =>
    import("@/features/map/components/brava-map").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <MapLoading />,
  }
);

export default function MapPage() {
  return <BravaMap />;
}
