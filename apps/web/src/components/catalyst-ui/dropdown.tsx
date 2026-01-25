"use client";

import * as Headless from "@headlessui/react";
import clsx from "clsx";
import NextLink from "next/link";
import React from "react";

/**
 * Dropdown menu container using HeadlessUI Menu.
 */
export function Dropdown({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Headless.Menu as="div" className={clsx("relative", className)}>
      {children}
    </Headless.Menu>
  );
}

/**
 * DropdownButton triggers the dropdown menu.
 */
export function DropdownButton({
  children,
  className,
  as,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
} & Omit<Headless.MenuButtonProps, "as" | "className">) {
  return (
    <Headless.MenuButton
      as={as}
      className={clsx(
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-blue focus-visible:ring-offset-2 rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </Headless.MenuButton>
  );
}

/**
 * DropdownMenu displays the menu items.
 */
export function DropdownMenu({
  children,
  className,
  anchor = "bottom end",
}: {
  children: React.ReactNode;
  className?: string;
  anchor?: "bottom" | "bottom start" | "bottom end" | "top" | "top start" | "top end";
}) {
  return (
    <Headless.MenuItems
      transition
      anchor={anchor}
      className={clsx(
        "z-50 mt-2 min-w-[180px] origin-top-right rounded-card p-1",
        "bg-surface border border-hairline shadow-floating",
        "transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0",
        "[--anchor-gap:8px]",
        className
      )}
    >
      {children}
    </Headless.MenuItems>
  );
}

/**
 * DropdownItem is a single menu item.
 * Can be a button or link.
 */
export function DropdownItem({
  children,
  className,
  href,
  disabled,
  destructive,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  disabled?: boolean;
  destructive?: boolean;
} & (
  | Omit<React.ComponentPropsWithoutRef<"button">, "className">
  | Omit<React.ComponentPropsWithoutRef<typeof NextLink>, "className">
)) {
  const classes = clsx(
    "group flex w-full items-center gap-3 rounded-button px-3 py-2 text-sm font-medium",
    "transition-colors duration-75",
    disabled
      ? "text-muted cursor-not-allowed"
      : destructive
        ? "text-red-600 dark:text-red-400 data-focus:bg-red-50 dark:data-focus:bg-red-900/20"
        : "text-body data-focus:bg-surface-alt",
    className
  );

  const content = (
    <>
      {children}
    </>
  );

  return (
    <Headless.MenuItem disabled={disabled}>
      {href ? (
        <NextLink href={href} className={classes}>
          {content}
        </NextLink>
      ) : (
        <button
          type="button"
          className={classes}
          disabled={disabled}
          {...(props as React.ComponentPropsWithoutRef<"button">)}
        >
          {content}
        </button>
      )}
    </Headless.MenuItem>
  );
}

/**
 * DropdownDivider separates menu sections.
 */
export function DropdownDivider({ className }: { className?: string }) {
  return (
    <div
      className={clsx("my-1 border-t border-hairline", className)}
      role="separator"
    />
  );
}

/**
 * DropdownLabel is a non-interactive section label.
 */
export function DropdownLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * DropdownShortcut displays keyboard shortcut hint.
 */
export function DropdownShortcut({
  keys,
  className,
}: {
  keys: string;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "ml-auto text-xs text-muted group-data-focus:text-body",
        className
      )}
    >
      {keys}
    </span>
  );
}
