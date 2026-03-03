"use client";

import { clsx } from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMetadata } from "@/lib/api-contracts";
import type { AdminQueueResponse } from "@/types/admin";

export interface PaginationProps {
  /** Current page (0-based) */
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Extract PaginationProps from a PaginatedResult response.
 */
export function fromPaginatedResult(pagination: PaginationMetadata | null): {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
} | null {
  if (!pagination) return null;
  return {
    currentPage: pagination.page,
    totalPages: pagination.totalPages,
    totalItems: pagination.totalElements,
    pageSize: pagination.size,
  };
}

/**
 * Extract PaginationProps from an AdminQueueResponse.
 */
export function fromAdminQueueResponse<T>(
  response: AdminQueueResponse<T> | undefined
): {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
} | null {
  if (!response) return null;
  const totalPages = Math.ceil(response.total / response.pageSize);
  return {
    currentPage: response.page,
    totalPages,
    totalItems: response.total,
    pageSize: response.pageSize,
  };
}

/**
 * Generate page numbers with ellipsis for display.
 * Returns an array of page numbers (0-based) and -1 for ellipsis.
 */
function getPageNumbers(
  currentPage: number,
  totalPages: number
): (number | -1)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages: (number | -1)[] = [];

  // Always show first page
  pages.push(0);

  if (currentPage > 2) {
    pages.push(-1); // ellipsis
  }

  // Pages around current
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages - 2, currentPage + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 3) {
    pages.push(-1); // ellipsis
  }

  // Always show last page
  pages.push(totalPages - 1);

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const isFirst = currentPage === 0;
  const isLast = currentPage >= totalPages - 1;
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalItems);

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const buttonBase =
    "inline-flex items-center justify-center rounded-button border border-hairline text-sm font-medium transition-colors focus-ring disabled:opacity-40 disabled:cursor-not-allowed";
  const navButton = clsx(
    buttonBase,
    "h-10 px-3 bg-surface hover:bg-surface-alt text-body"
  );
  const pageButton = clsx(
    buttonBase,
    "h-10 w-10 bg-surface hover:bg-surface-alt text-body"
  );
  const activePageButton = clsx(
    "inline-flex items-center justify-center rounded-button text-sm font-bold h-10 w-10 bg-ocean-blue text-white"
  );

  return (
    <nav
      aria-label="Pagination"
      className={clsx(
        "flex flex-col items-center gap-3 py-4 sm:flex-row sm:justify-between",
        className
      )}
    >
      {/* Mobile: simplified */}
      <div className="flex items-center gap-2 sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirst}
          className={navButton}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
          <span className="ml-1">Prev</span>
        </button>
        <span className="text-muted px-3 text-sm">
          Page {currentPage + 1} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLast}
          className={navButton}
          aria-label="Next page"
        >
          <span className="mr-1">Next</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Desktop: full controls */}
      <div className="hidden items-center gap-1 sm:flex">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirst}
          className={navButton}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
          <span className="ml-1">Prev</span>
        </button>

        {pageNumbers.map((page, idx) =>
          page === -1 ? (
            <span key={`ellipsis-${idx}`} className="text-muted px-1">
              &hellip;
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={page === currentPage ? activePageButton : pageButton}
              aria-label={`Page ${page + 1}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page + 1}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLast}
          className={navButton}
          aria-label="Next page"
        >
          <span className="mr-1">Next</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Item count */}
      <p className="text-muted text-sm">
        Showing {startItem}&ndash;{endItem} of {totalItems}
      </p>
    </nav>
  );
}
