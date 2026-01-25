import * as Headless from "@headlessui/react";
import clsx from "clsx";
import NextLink from "next/link";
import React, { forwardRef } from "react";

const styles = {
  base: [
    // Base
    "relative isolate inline-flex items-baseline justify-center gap-x-2 rounded-lg border text-base/6 font-semibold",
    // Sizing
    "px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)] sm:text-sm/6",
    // Focus
    "focus:not-data-focus:outline-hidden data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-ocean-blue",
    // Disabled
    "data-disabled:opacity-50",
    // Icon
    "*:data-[slot=icon]:-mx-0.5 *:data-[slot=icon]:my-0.5 *:data-[slot=icon]:size-5 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:self-center *:data-[slot=icon]:text-(--btn-icon) sm:*:data-[slot=icon]:my-1 sm:*:data-[slot=icon]:size-4 forced-colors:[--btn-icon:ButtonText] forced-colors:data-hover:[--btn-icon:ButtonText]",
  ],
  solid: [
    // Optical border, implemented as the button background to avoid corner artifacts
    "border-transparent bg-(--btn-border)",
    // Dark mode: border is rendered on `after` so background is set to button background
    "dark:bg-(--btn-bg)",
    // Button background, implemented as foreground layer to stack on top of pseudo-border layer
    "before:absolute before:inset-0 before:-z-10 before:rounded-[calc(var(--radius-lg)-1px)] before:bg-(--btn-bg)",
    // Drop shadow, applied to the inset `before` layer so it blends with the border
    "before:shadow-sm",
    // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
    "dark:before:hidden",
    // Dark mode: Subtle white outline is applied using a border
    "dark:border-white/5",
    // Shim/overlay, inset to match button foreground and used for hover state + highlight shadow
    "after:absolute after:inset-0 after:-z-10 after:rounded-[calc(var(--radius-lg)-1px)]",
    // Inner highlight shadow
    "after:shadow-[inset_0_1px_--theme(--color-white/15%)]",
    // White overlay on hover
    "data-active:after:bg-(--btn-hover-overlay) data-hover:after:bg-(--btn-hover-overlay)",
    // Dark mode: `after` layer expands to cover entire button
    "dark:after:-inset-px dark:after:rounded-lg",
    // Disabled
    "data-disabled:before:shadow-none data-disabled:after:shadow-none",
  ],
  outline: [
    // Base
    "border-basalt-900/10 text-basalt-900 data-active:bg-basalt-900/2.5 data-hover:bg-basalt-900/2.5",
    // Dark mode
    "dark:border-border-primary/15 dark:text-text-primary dark:[--btn-bg:transparent] dark:data-active:bg-background-primary/5 dark:data-hover:bg-background-primary/5",
    // Icon
    "[--btn-icon:var(--color-basalt-500)] data-active:[--btn-icon:var(--color-basalt-800)] data-hover:[--btn-icon:var(--color-basalt-800)] dark:data-active:[--btn-icon:var(--color-mist-200)] dark:data-hover:[--btn-icon:var(--color-mist-200)]",
  ],
  plain: [
    // Base
    "border-transparent text-basalt-900 data-active:bg-basalt-900/5 data-hover:bg-basalt-900/5",
    // Dark mode
    "dark:text-text-primary dark:data-active:bg-background-primary/10 dark:data-hover:bg-background-primary/10",
    // Icon
    "[--btn-icon:var(--color-basalt-500)] data-active:[--btn-icon:var(--color-basalt-800)] data-hover:[--btn-icon:var(--color-basalt-800)] dark:[--btn-icon:var(--color-basalt-500)] dark:data-active:[--btn-icon:var(--color-mist-200)] dark:data-hover:[--btn-icon:var(--color-mist-200)]",
  ],
  colors: {
    // Primary actions (Ocean Blue)
    blue: [
      "text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-ocean-blue)] [--btn-border:var(--color-ocean-blue)]/90",
      "[--btn-icon:var(--color-white)] data-active:[--btn-icon:var(--color-white)] data-hover:[--btn-icon:var(--color-white)]",
    ],
    // Secondary actions (basalt)
    dark: [
      "text-white [--btn-bg:var(--color-basalt-900)] [--btn-border:var(--color-basalt-900)]/90 [--btn-hover-overlay:var(--color-white)]/10",
      "dark:[--btn-hover-overlay:var(--color-white)]/5 dark:[--btn-bg:var(--color-basalt-800)]",
      "[--btn-icon:var(--color-mist-200)] data-active:[--btn-icon:var(--color-mist-100)] data-hover:[--btn-icon:var(--color-mist-100)]",
    ],
    // Default (dark/zinc variant)
    "dark/zinc": [
      "text-white [--btn-bg:var(--color-basalt-900)] [--btn-border:var(--color-basalt-900)]/90 [--btn-hover-overlay:var(--color-white)]/10",
      "dark:text-text-primary dark:[--btn-bg:var(--color-basalt-800)] dark:[--btn-hover-overlay:var(--color-text-primary)]/5",
      "[--btn-icon:var(--color-mist-200)] data-active:[--btn-icon:var(--color-mist-100)] data-hover:[--btn-icon:var(--color-mist-100)]",
    ],
    // Alternative dark
    "dark/white": [
      "text-white [--btn-bg:var(--color-basalt-900)] [--btn-border:var(--color-basalt-900)]/90 [--btn-hover-overlay:var(--color-white)]/10",
      "dark:text-text-primary dark:[--btn-bg:var(--color-background-primary)] dark:[--btn-hover-overlay:var(--color-text-primary)]/5",
      "[--btn-icon:var(--color-mist-200)] data-active:[--btn-icon:var(--color-mist-100)] data-hover:[--btn-icon:var(--color-mist-100)] dark:[--btn-icon:var(--color-basalt-500)] dark:data-active:[--btn-icon:var(--color-mist-200)] dark:data-hover:[--btn-icon:var(--color-mist-200)]",
    ],
    // Light backgrounds
    white: [
      "text-basalt-900 [--btn-bg:white] [--btn-border:var(--color-basalt-900)]/10 [--btn-hover-overlay:var(--color-basalt-900)]/2.5 data-active:[--btn-border:var(--color-basalt-900)]/15 data-hover:[--btn-border:var(--color-basalt-900)]/15",
      "dark:[--btn-hover-overlay:var(--color-basalt-900)]/5",
      "[--btn-icon:var(--color-mist-200)] data-active:[--btn-icon:var(--color-basalt-500)] data-hover:[--btn-icon:var(--color-basalt-500)]",
    ],
    light: [
      "text-basalt-900 [--btn-bg:white] [--btn-border:var(--color-basalt-900)]/10 [--btn-hover-overlay:var(--color-basalt-900)]/2.5 data-active:[--btn-border:var(--color-basalt-900)]/15 data-hover:[--btn-border:var(--color-basalt-900)]/15",
      "dark:text-text-primary dark:[--btn-hover-overlay:var(--color-text-primary)]/5 dark:[--btn-bg:var(--color-basalt-900)]",
      "[--btn-icon:var(--color-basalt-500)] data-active:[--btn-icon:var(--color-basalt-800)] data-hover:[--btn-icon:var(--color-basalt-800)] dark:[--btn-icon:var(--color-basalt-500)] dark:data-active:[--btn-icon:var(--color-mist-200)] dark:data-hover:[--btn-icon:var(--color-mist-200)]",
    ],
    zinc: [
      "text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-basalt-500)] [--btn-border:var(--color-basalt-800)]/90",
      "dark:[--btn-hover-overlay:var(--color-white)]/5",
      "[--btn-icon:var(--color-mist-200)] data-active:[--btn-icon:var(--color-mist-100)] data-hover:[--btn-icon:var(--color-mist-100)]",
    ],
    // Destructive actions
    red: [
      "text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-red-600)] [--btn-border:var(--color-red-700)]/90",
      "[--btn-icon:var(--color-red-300)] data-active:[--btn-icon:var(--color-red-200)] data-hover:[--btn-icon:var(--color-red-200)]",
    ],
    // Success states
    green: [
      "text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-green-600)] [--btn-border:var(--color-green-700)]/90",
      "[--btn-icon:var(--color-white)]/60 data-active:[--btn-icon:var(--color-white)]/80 data-hover:[--btn-icon:var(--color-white)]/80",
    ],
    // Warning (sobrado-ochre)
    yellow: [
      "text-white [--btn-hover-overlay:var(--color-white)]/25 [--btn-bg:var(--color-sobrado-ochre)] [--btn-border:var(--color-sobrado-ochre)]/80",
      "[--btn-icon:var(--color-white)]/80 data-active:[--btn-icon:var(--color-white)] data-hover:[--btn-icon:var(--color-white)]",
    ],
  },
};

type ButtonProps = (
  | { color?: keyof typeof styles.colors; outline?: never; plain?: never }
  | { color?: never; outline: true; plain?: never }
  | { color?: never; outline?: never; plain: true }
) & { className?: string; children: React.ReactNode } & (
    | Omit<Headless.ButtonProps, "as" | "className">
    | Omit<React.ComponentPropsWithoutRef<typeof NextLink>, "className">
  );

export const Button = forwardRef(function Button(
  { color, outline, plain, className, children, ...props }: ButtonProps,
  ref: React.ForwardedRef<HTMLElement>
) {
  function getVariantStyles(): string[] {
    if (outline) return styles.outline;
    if (plain) return styles.plain;
    return [...styles.solid, ...styles.colors[color ?? "dark/zinc"]];
  }

  const classes = clsx(className, styles.base, getVariantStyles());

  return "href" in props ? (
    <NextLink
      {...(props as React.ComponentPropsWithoutRef<typeof NextLink>)}
      className={classes}
      ref={ref as React.ForwardedRef<HTMLAnchorElement>}
    >
      <TouchTarget>{children}</TouchTarget>
    </NextLink>
  ) : (
    <Headless.Button
      {...props}
      className={clsx(classes, "cursor-default")}
      ref={ref}
    >
      <TouchTarget>{children}</TouchTarget>
    </Headless.Button>
  );
});

/**
 * Expand the hit area to at least 44×44px on touch devices
 */
export function TouchTarget({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span
        className="absolute top-1/2 left-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 pointer-fine:hidden"
        aria-hidden="true"
      />
      {children}
    </>
  );
}
