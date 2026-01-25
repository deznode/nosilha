import * as Headless from "@headlessui/react";
import clsx from "clsx";
import NextLink from "next/link";
import React, { forwardRef } from "react";
import { TouchTarget } from "./button";

const colors = {
  // Primary (Ocean Blue)
  blue: "bg-ocean-blue/15 text-ocean-blue group-data-hover:bg-ocean-blue/25 dark:text-ocean-blue-light dark:group-data-hover:bg-ocean-blue/25",
  // Destructive
  red: "bg-red-500/15 text-red-700 group-data-hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:group-data-hover:bg-red-500/20",
  // Success
  green:
    "bg-green-500/15 text-green-700 group-data-hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:group-data-hover:bg-green-500/20",
  // Warning (sobrado-ochre)
  yellow:
    "bg-sobrado-ochre/20 text-sobrado-ochre group-data-hover:bg-sobrado-ochre/30 dark:bg-sobrado-ochre/10 dark:text-sobrado-ochre dark:group-data-hover:bg-sobrado-ochre/15",
  // Neutral (default)
  zinc: "bg-zinc-600/10 text-zinc-700 group-data-hover:bg-zinc-600/20 dark:bg-background-primary/5 dark:text-text-secondary dark:group-data-hover:bg-background-primary/10",
};

type BadgeProps = { color?: keyof typeof colors };

export function Badge({
  color = "zinc",
  className,
  ...props
}: BadgeProps & React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      {...props}
      className={clsx(
        className,
        "inline-flex items-center gap-x-1.5 rounded-md px-1.5 py-0.5 text-sm/5 font-medium sm:text-xs/5 forced-colors:outline",
        colors[color]
      )}
    />
  );
}

export const BadgeButton = forwardRef(function BadgeButton(
  {
    color = "zinc",
    className,
    children,
    ...props
  }: BadgeProps & { className?: string; children: React.ReactNode } & (
      | Omit<Headless.ButtonProps, "as" | "className">
      | Omit<React.ComponentPropsWithoutRef<typeof NextLink>, "className">
    ),
  ref: React.ForwardedRef<HTMLElement>
) {
  const classes = clsx(
    className,
    "group relative inline-flex rounded-md focus:not-data-focus:outline-hidden data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-ocean-blue"
  );

  return "href" in props ? (
    <NextLink
      {...(props as React.ComponentPropsWithoutRef<typeof NextLink>)}
      className={classes}
      ref={ref as React.ForwardedRef<HTMLAnchorElement>}
    >
      <TouchTarget>
        <Badge color={color}>{children}</Badge>
      </TouchTarget>
    </NextLink>
  ) : (
    <Headless.Button {...props} className={classes} ref={ref}>
      <TouchTarget>
        <Badge color={color}>{children}</Badge>
      </TouchTarget>
    </Headless.Button>
  );
});
