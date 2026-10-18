"use client";

import { useState } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  size?: "sm" | "md" | "lg";
};

/**
 * Pagination component for navigating through paged content.
 */
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  size = "md",
}: PaginationProps) {
  const sizes = {
    sm: "h-8 min-w-8 text-xs",
    md: "h-10 min-w-10 text-sm",
    lg: "h-12 min-w-12 text-base",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Generate page numbers to show
  function getPageNumbers(): (number | "ellipsis")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [1];

    if (currentPage > 3) {
      pages.push("ellipsis");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("ellipsis");
    }

    pages.push(totalPages);

    return pages;
  }

  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={clsx(
          "rounded-button inline-flex items-center justify-center transition-colors",
          sizes[size],
          "text-muted hover:bg-surface-alt hover:text-body",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent",
          "focus-visible:ring-ocean-blue focus:outline-none focus-visible:ring-2"
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className={iconSizes[size]} />
      </button>

      {/* Page Numbers */}
      {showPageNumbers && (
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className={clsx(
                  "text-muted inline-flex items-center justify-center",
                  sizes[size]
                )}
              >
                <MoreHorizontal className={iconSizes[size]} />
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={clsx(
                  "rounded-button inline-flex items-center justify-center font-medium transition-colors",
                  sizes[size],
                  page === currentPage
                    ? "bg-ocean-blue text-white"
                    : "text-muted hover:bg-surface-alt hover:text-body",
                  "focus-visible:ring-ocean-blue focus:outline-none focus-visible:ring-2"
                )}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            )
          )}
        </div>
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={clsx(
          "rounded-button inline-flex items-center justify-center transition-colors",
          sizes[size],
          "text-muted hover:bg-surface-alt hover:text-body",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent",
          "focus-visible:ring-ocean-blue focus:outline-none focus-visible:ring-2"
        )}
        aria-label="Next page"
      >
        <ChevronRight className={iconSizes[size]} />
      </button>
    </nav>
  );
}

/**
 * Pagination specimen for the design system gallery.
 * Showcases pagination patterns and variants.
 */
export function PaginationSpecimen() {
  const [page1, setPage1] = useState(1);
  const [page2, setPage2] = useState(5);
  const [page3, setPage3] = useState(1);

  return (
    <div className="space-y-10">
      {/* Basic Pagination */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Basic Pagination
        </h3>
        <p className="text-muted mb-4 text-sm">
          Standard pagination with page numbers. Current page: {page1}
        </p>
        <Pagination
          currentPage={page1}
          totalPages={10}
          onPageChange={setPage1}
        />
      </div>

      {/* Ellipsis Pagination */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          With Ellipsis
        </h3>
        <p className="text-muted mb-4 text-sm">
          Ellipsis collapses large page ranges. Current page: {page2}
        </p>
        <Pagination
          currentPage={page2}
          totalPages={20}
          onPageChange={setPage2}
        />
      </div>

      {/* Simple Pagination */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Simple (Prev/Next Only)
        </h3>
        <p className="text-muted mb-4 text-sm">
          Minimal pagination for mobile or limited space. Page {page3} of 10.
        </p>
        <div className="flex items-center gap-4">
          <Pagination
            currentPage={page3}
            totalPages={10}
            onPageChange={setPage3}
            showPageNumbers={false}
          />
          <span className="text-muted text-sm">Page {page3} of 10</span>
        </div>
      </div>

      {/* Size Variants */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Size Variants
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-muted mb-2 text-xs">Small (sm):</p>
            <Pagination
              currentPage={3}
              totalPages={7}
              onPageChange={() => {}}
              size="sm"
            />
          </div>
          <div>
            <p className="text-muted mb-2 text-xs">Medium (md) - default:</p>
            <Pagination
              currentPage={3}
              totalPages={7}
              onPageChange={() => {}}
              size="md"
            />
          </div>
          <div>
            <p className="text-muted mb-2 text-xs">Large (lg):</p>
            <Pagination
              currentPage={3}
              totalPages={7}
              onPageChange={() => {}}
              size="lg"
            />
          </div>
        </div>
      </div>

      {/* In Context */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          In Context
        </h3>
        <div className="border-hairline rounded-card border p-4">
          <div className="mb-4 space-y-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-surface-alt rounded-button flex items-center gap-3 p-3"
              >
                <div className="bg-surface h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <p className="text-body text-sm font-medium">
                    Directory Entry {item}
                  </p>
                  <p className="text-muted text-xs">Category • Location</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-hairline flex items-center justify-between border-t pt-4">
            <span className="text-muted text-sm">
              Showing 1-3 of 30 results
            </span>
            <Pagination
              currentPage={1}
              totalPages={10}
              onPageChange={() => {}}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Accessibility Notes */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Accessibility
        </h3>
        <div className="bg-surface-alt rounded-card space-y-2 p-4">
          <div className="flex items-start gap-3">
            <span className="text-valley-green text-lg">✓</span>
            <p className="text-body text-sm">
              <strong>aria-label</strong> on nav and buttons for screen readers
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-valley-green text-lg">✓</span>
            <p className="text-body text-sm">
              <strong>aria-current=&quot;page&quot;</strong> marks active page
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-valley-green text-lg">✓</span>
            <p className="text-body text-sm">
              <strong>Keyboard navigation</strong> - Tab to navigate,
              Enter/Space to select
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-valley-green text-lg">✓</span>
            <p className="text-body text-sm">
              <strong>Disabled states</strong> - First/last page buttons
              appropriately disabled
            </p>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="border-hairline bg-surface rounded-card border p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">Usage</h3>
        <div className="space-y-2">
          <code className="text-muted block text-sm">
            {`// Pagination is a local component pattern`}
          </code>
          <code className="text-muted block text-sm">
            {`// Copy from design-system specimens or implement your own`}
          </code>
          <div className="border-hairline my-2 border-t" />
          <code className="text-muted block text-sm">
            {`const [page, setPage] = useState(1);`}
          </code>
          <code className="text-muted block text-sm">{``}</code>
          <code className="text-muted block text-sm">{`<Pagination`}</code>
          <code className="text-muted block pl-4 text-sm">
            {`currentPage={page}`}
          </code>
          <code className="text-muted block pl-4 text-sm">
            {`totalPages={totalPages}`}
          </code>
          <code className="text-muted block pl-4 text-sm">
            {`onPageChange={setPage}`}
          </code>
          <code className="text-muted block pl-4 text-sm">{`size="md"`}</code>
          <code className="text-muted block text-sm">{`/>`}</code>
        </div>
      </div>
    </div>
  );
}
