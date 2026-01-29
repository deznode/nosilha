import { GalleryNav } from "./_components/gallery-nav";

export const metadata = {
  title: "Design System | Nos Ilha",
  description: "Brava Tones design system gallery and documentation",
  robots: "noindex, nofollow",
};

interface DesignSystemLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout for design system gallery.
 * Features sidebar navigation on desktop and horizontal tabs on mobile.
 */
export default function DesignSystemLayout({
  children,
}: DesignSystemLayoutProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-card bg-ocean-blue/10 dark:bg-ocean-blue/20 p-2">
            <svg
              className="text-ocean-blue h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-body font-serif text-2xl font-bold md:text-3xl">
              Design System
            </h1>
            <p className="text-muted text-sm">
              Brava Tones • Nos Ilha visual foundations
            </p>
          </div>
        </div>

        {/* Dev mode badge */}
        <div className="rounded-badge bg-sunny-yellow/20 text-sobrado-ochre mt-4 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium">
          <span className="bg-sunny-yellow h-2 w-2 animate-pulse rounded-full" />
          Development Only
        </div>
      </header>

      {/* Main content with sidebar */}
      <div className="lg:flex lg:gap-12">
        <GalleryNav />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
