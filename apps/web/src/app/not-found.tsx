import Link from "next/link";
import { Home, Map, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        {/* 404 Number */}
        <h1 className="text-ocean-blue font-serif text-7xl font-bold md:text-9xl">
          404
        </h1>

        {/* Error Message */}
        <h2 className="mt-4 font-serif text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-50">
          Página não encontrada
        </h2>
        <p className="mx-auto mt-3 max-w-md text-slate-600 dark:text-slate-400">
          A página que procura não existe ou foi movida. Explore o nosso
          diretório ou volte à página inicial.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="bg-ocean-blue hover:bg-ocean-blue/90 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-semibold text-white transition-colors"
          >
            <Home className="h-4 w-4" />
            Página inicial
          </Link>
          <Link
            href="/directory"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Search className="h-4 w-4" />
            Explorar diretório
          </Link>
          <Link
            href="/map"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Map className="h-4 w-4" />
            Ver mapa
          </Link>
        </div>

        {/* Decorative Element */}
        <div className="mt-12">
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Precisa de ajuda?{" "}
            <Link href="/contact" className="text-ocean-blue hover:underline">
              Entre em contato
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
