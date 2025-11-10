'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/catalyst-ui/button';
import { PrinterIcon } from '@heroicons/react/24/outline';

interface PrintButtonProps {
  /**
   * Button variant (from Catalyst UI)
   */
  variant?: 'primary' | 'secondary' | 'outline';

  /**
   * Custom label text (defaults to "Print")
   */
  label?: string;

  /**
   * Whether to show the printer icon
   */
  showIcon?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Optional callback after print dialog is triggered
   */
  onAfterPrint?: () => void;
}

/**
 * Print Button Component for Cultural Heritage Pages
 *
 * Provides optimized printing functionality for cultural heritage content with:
 * - Clean layout without navigation/toolbars (via print.css)
 * - Readable typography (12pt minimum)
 * - High contrast for accessibility
 * - Citation URL in footer
 * - Proper page break handling
 *
 * **Features**:
 * - Invokes browser's native print dialog (window.print())
 * - Automatically applies print-optimized stylesheet
 * - Sets page URL in body data attribute for citation footer
 * - Works across all modern browsers (Chrome, Firefox, Safari, Edge)
 *
 * **Print Stylesheet**: frontend/src/styles/print.css
 *
 * **Accessibility**:
 * - ARIA label for screen readers
 * - Keyboard accessible (Enter/Space to activate)
 * - Visible focus indicator
 * - 44×44px minimum touch targets on mobile (WCAG 2.1 AA)
 *
 * @example
 * <PrintButton
 *   variant="secondary"
 *   label="Print"
 *   showIcon={true}
 * />
 */
export function PrintButton({
  variant = 'secondary',
  label = 'Print',
  showIcon = true,
  className = '',
  onAfterPrint,
}: PrintButtonProps) {
  /**
   * Set page URL in body data attribute for print citation footer
   * The print.css uses body::after { content: "Source: " attr(data-url); }
   * This satisfies T076: Add page URL to print footer for citation
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      document.body.setAttribute('data-url', currentUrl);
    }

    return () => {
      // Cleanup: remove data attribute when component unmounts
      if (typeof document !== 'undefined') {
        document.body.removeAttribute('data-url');
      }
    };
  }, []);

  /**
   * Handle print button click
   * Invokes browser's native print dialog which applies @media print styles
   * Satisfies T073: Implement window.print() invocation with print stylesheet
   */
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      // Trigger browser print dialog
      window.print();

      // Optional callback after print dialog is triggered
      if (onAfterPrint) {
        onAfterPrint();
      }
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handlePrint}
      aria-label={`${label} this page`}
      className={`
        /* T045: Ensure 44×44px minimum touch targets on mobile (US6) */
        min-h-[44px] min-w-[44px]

        /* T048: Responsive icon sizes (larger on mobile) */
        text-base md:text-sm

        /* Don't show print button in print view */
        print:hidden

        ${className}
      `.trim()}
    >
      {showIcon && (
        <PrinterIcon
          className="
            /* T048: Larger icons on mobile for better touch targets */
            h-6 w-6 md:h-5 md:w-5
            mr-2
          "
          aria-hidden="true"
        />
      )}
      {label}
    </Button>
  );
}
