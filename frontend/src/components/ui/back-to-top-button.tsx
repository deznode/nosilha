'use client';

export function BackToTopButton() {
  return (
    <div className="mt-16 text-center">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="inline-flex items-center rounded-md border-2 border-ocean-blue px-4 py-2 text-sm font-medium text-ocean-blue transition-colors hover:bg-ocean-blue hover:text-white"
      >
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
        Back to Top
      </button>
    </div>
  );
}