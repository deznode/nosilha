'use client';

import { PrintButton } from '@/components/ui/print-button';
import { usePrintScrollFix } from '@/lib/print-utils';

interface PrintPageWrapperProps {
  children: React.ReactNode;
}

/**
 * Client Component wrapper that provides print functionality to Server Component pages
 * - Attaches print scroll position fix hook
 * - Renders PrintButton and child content
 */
export function PrintPageWrapper({ children }: PrintPageWrapperProps) {
  // Attach scroll position fix for print
  usePrintScrollFix();

  return <>{children}</>;
}
