import * as Headless from "@headlessui/react";
import clsx from "clsx";
import React, { forwardRef } from "react";

export function InputGroup({
  children,
}: React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      data-slot="control"
      className={clsx(
        "relative isolate block",
        "has-[[data-slot=icon]:first-child]:[&_input]:pl-10 has-[[data-slot=icon]:last-child]:[&_input]:pr-10 sm:has-[[data-slot=icon]:first-child]:[&_input]:pl-8 sm:has-[[data-slot=icon]:last-child]:[&_input]:pr-8",
        "*:data-[slot=icon]:pointer-events-none *:data-[slot=icon]:absolute *:data-[slot=icon]:top-3 *:data-[slot=icon]:z-10 *:data-[slot=icon]:size-5 sm:*:data-[slot=icon]:top-2.5 sm:*:data-[slot=icon]:size-4",
        "[&>[data-slot=icon]:first-child]:left-3 sm:[&>[data-slot=icon]:first-child]:left-2.5 [&>[data-slot=icon]:last-child]:right-3 sm:[&>[data-slot=icon]:last-child]:right-2.5",
        "*:data-[slot=icon]:text-basalt-500 dark:*:data-[slot=icon]:text-mist-200"
      )}
    >
      {children}
    </span>
  );
}

const dateTypes = ["date", "datetime-local", "month", "time", "week"];
type DateType = (typeof dateTypes)[number];

// Height and colors are selected here rather than overridden by the caller: a
// passed `className` lands on the outer `data-slot="control"` wrapper and never
// reaches the real <input>, so it cannot restyle the control at all.
// Spec 037 FR-010.
const inputSizes = {
  // Moved verbatim out of the class list below, so omitting `size` renders a
  // byte-identical <input>.
  md: "px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)]",
  // Site chrome: 44px at every breakpoint.
  lg: "h-11 px-3",
};

const inputAppearances = {
  default: [
    // Typography
    "dark:text-text-primary text-base/6 text-basalt-900 placeholder:text-basalt-500 sm:text-sm/6",
    // Border
    "border border-basalt-900/10 data-hover:border-basalt-900/20 dark:border-white/10 dark:data-hover:border-white/20",
    // Background color
    "dark:bg-background-primary/5 bg-transparent",
  ],
  // An always-dark ground in both themes — the footer. Deliberately carries no
  // `dark:` variant: the footer does not flip with the theme, so a theme-reactive
  // token would resolve to its light value on a permanently dark surface, which
  // is the contrast bug this set exists to prevent. Spec 037 FR-009.
  onDark: [
    "text-footer-heading placeholder:text-footer-placeholder text-base/6 sm:text-sm/6",
    "border border-footer-input-border data-hover:border-footer-input-border",
    "bg-footer-input-bg",
  ],
};

export const Input = forwardRef(function Input(
  {
    className,
    size = "md",
    appearance = "default",
    ...props
  }: {
    className?: string;
    /** `lg` is the 44px site-chrome control. Omit for the default. */
    size?: keyof typeof inputSizes;
    /** `onDark` for a control on an always-dark ground, e.g. the footer. */
    appearance?: keyof typeof inputAppearances;
    type?:
      | "email"
      | "number"
      | "password"
      | "search"
      | "tel"
      | "text"
      | "url"
      | DateType;
    // `size` is omitted from the native props: HTML inputs have their own
    // numeric `size` attribute, which no call site uses and which would
    // otherwise collide with the variant prop above.
  } & Omit<Headless.InputProps, "as" | "className" | "size">,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  return (
    <span
      data-slot="control"
      className={clsx([
        className,
        // Basic layout
        "relative block w-full",
        // Background color + shadow applied to inset pseudo element, so shadow blends with border in light mode
        "before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white before:shadow-sm",
        // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
        "dark:before:hidden",
        // On an always-dark ground the white backdrop would show through the
        // control's own translucent-free background in light mode, so drop it.
        appearance === "onDark" && "before:hidden",
        // Focus ring
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset sm:focus-within:after:ring-2 sm:focus-within:after:ring-ocean-blue",
        // Disabled state
        "has-data-disabled:opacity-50 has-data-disabled:before:bg-basalt-900/5 has-data-disabled:before:shadow-none",
        // Invalid state
        "has-data-invalid:before:shadow-red-500/10",
      ])}
    >
      <Headless.Input
        ref={ref}
        {...props}
        className={clsx([
          // Date classes
          props.type &&
            dateTypes.includes(props.type) && [
              "[&::-webkit-datetime-edit-fields-wrapper]:p-0",
              "[&::-webkit-date-and-time-value]:min-h-[1.5em]",
              "[&::-webkit-datetime-edit]:inline-flex",
              "[&::-webkit-datetime-edit]:p-0",
              "[&::-webkit-datetime-edit-year-field]:p-0",
              "[&::-webkit-datetime-edit-month-field]:p-0",
              "[&::-webkit-datetime-edit-day-field]:p-0",
              "[&::-webkit-datetime-edit-hour-field]:p-0",
              "[&::-webkit-datetime-edit-minute-field]:p-0",
              "[&::-webkit-datetime-edit-second-field]:p-0",
              "[&::-webkit-datetime-edit-millisecond-field]:p-0",
              "[&::-webkit-datetime-edit-meridiem-field]:p-0",
            ],
          // Basic layout
          "relative block w-full appearance-none rounded-lg",
          inputSizes[size],
          // Typography, border and background
          inputAppearances[appearance],
          // Hide default focus styles
          "focus:outline-hidden",
          // Invalid state
          "data-invalid:border-red-500 data-invalid:data-hover:border-red-500 dark:data-invalid:border-red-500 dark:data-invalid:data-hover:border-red-500",
          // Disabled state
          "data-disabled:border-basalt-900/20 dark:data-disabled:border-white/15 dark:data-disabled:bg-white/2.5 dark:data-hover:data-disabled:border-white/15",
          // System icons
          "dark:scheme-dark",
        ])}
      />
    </span>
  );
});
