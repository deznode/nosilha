import * as Headless from "@headlessui/react";
import clsx from "clsx";
import React, { forwardRef } from "react";

type ResizeOption = "none" | "vertical" | "horizontal" | "both";

const resizeClasses: Record<ResizeOption, string> = {
  none: "resize-none",
  vertical: "resize-y",
  horizontal: "resize-x",
  both: "resize",
};

export const Textarea = forwardRef(function Textarea(
  {
    className,
    rows = 4,
    resize = "vertical",
    ...props
  }: {
    className?: string;
    rows?: number;
    resize?: ResizeOption;
  } & Omit<Headless.TextareaProps, "as" | "className">,
  ref: React.ForwardedRef<HTMLTextAreaElement>
) {
  return (
    <span
      data-slot="control"
      className={clsx([
        className,
        // Basic layout
        "relative block w-full",
        // Background color + shadow applied to inset pseudo element, so shadow blends with border in light mode
        "before:shadow-subtle before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white",
        // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
        "dark:before:hidden",
        // Focus ring
        "sm:focus-within:after:ring-ocean-blue after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset sm:focus-within:after:ring-2",
        // Disabled state
        "has-data-disabled:before:bg-basalt-900/5 has-data-disabled:opacity-50 has-data-disabled:before:shadow-none",
        // Invalid state
        "has-data-invalid:before:shadow-red-500/10",
      ])}
    >
      <Headless.Textarea
        ref={ref}
        rows={rows}
        {...props}
        className={clsx([
          // Basic layout
          "relative block w-full appearance-none rounded-lg px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)]",
          // Typography
          "dark:text-text-primary text-basalt-900 placeholder:text-basalt-500 text-base/6 sm:text-sm/6",
          // Border
          "border-basalt-900/10 data-hover:border-basalt-900/20 border dark:border-white/10 dark:data-hover:border-white/20",
          // Background color
          "dark:bg-background-primary/5 bg-transparent",
          // Hide default focus styles
          "focus:outline-hidden",
          // Invalid state
          "data-invalid:border-red-500 data-invalid:data-hover:border-red-500 dark:data-invalid:border-red-500 dark:data-invalid:data-hover:border-red-500",
          // Disabled state
          "data-disabled:border-basalt-900/20 dark:data-disabled:border-white/15 dark:data-disabled:bg-white/2.5 dark:data-hover:data-disabled:border-white/15",
          // Resize behavior
          resizeClasses[resize],
          // Min height to prevent collapse
          "min-h-[80px]",
        ])}
      />
    </span>
  );
});
