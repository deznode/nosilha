'use client'; // Client Component marker for Next.js

import { PrinterIcon } from '@heroicons/react/24/outline';

interface PrintButtonProps {
  /**
   * Additional Tailwind CSS classes for customization
   * @example "ml-4 mt-2" for positioning
   */
  className?: string;

  /**
   * Visual variant of the button
   * - 'primary': Ocean blue background, prominent style
   * - 'secondary': Outlined style, less prominent
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary';

  /**
   * Button label text
   * @default "Print"
   */
  label?: string;

  /**
   * Whether to show printer icon alongside text
   * @default true
   */
  showIcon?: boolean;
}

export function PrintButton({
  className,
  variant = 'primary',
  label = 'Print',
  showIcon = true,
}: PrintButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  // Variant-based styling
  const baseStyles = 'print:hidden inline-flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors';
  const variantStyles = variant === 'primary'
    ? 'bg-ocean-blue text-white hover:bg-ocean-blue/90'
    : 'border-2 border-ocean-blue text-ocean-blue hover:bg-ocean-blue hover:text-white';

  return (
    <button
      onClick={handlePrint}
      className={`${baseStyles} ${variantStyles} ${className}`}
      aria-label="Print this page"
    >
      {showIcon && <PrinterIcon className="h-5 w-5" />}
      {label}
    </button>
  );
}
