import { Link } from "@/i18n/navigation";
import { Home, Map, Search } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("errors.notFound");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        <h1 className="text-ocean-blue font-serif text-7xl font-bold md:text-9xl">
          404
        </h1>

        <h2 className="text-body mt-4 font-serif text-2xl font-semibold md:text-3xl">
          {t("title")}
        </h2>
        <p className="text-muted mx-auto mt-3 max-w-md">{t("body")}</p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="bg-ocean-blue hover:bg-ocean-blue/90 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-semibold text-white transition-colors"
          >
            <Home className="h-4 w-4" />
            {t("home")}
          </Link>
          <Link
            href="/settlements"
            className="border-hairline bg-canvas text-body hover:bg-surface inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 font-semibold transition-colors"
          >
            <Search className="h-4 w-4" />
            {t("settlements")}
          </Link>
          <Link
            href="/map"
            className="border-hairline bg-canvas text-body hover:bg-surface inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 font-semibold transition-colors"
          >
            <Map className="h-4 w-4" />
            {t("map")}
          </Link>
        </div>

        <div className="mt-12">
          <p className="text-muted text-sm">
            {t.rich("help", {
              link: (chunks) => (
                <Link
                  href="/contact"
                  className="text-ocean-blue hover:underline"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
