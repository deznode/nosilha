"use client";

import * as Headless from "@headlessui/react";
import clsx from "clsx";
import React from "react";

type PopoverProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Popover container using HeadlessUI.
 * Manages open/close state and provides context for trigger and panel.
 */
export function Popover({ children, className }: PopoverProps) {
  return (
    <Headless.Popover className={clsx("relative", className)}>
      {children}
    </Headless.Popover>
  );
}

type PopoverButtonProps = {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
};

/**
 * PopoverButton triggers the popover panel on click.
 */
export function PopoverButton({
  children,
  className,
  as,
}: PopoverButtonProps) {
  return (
    <Headless.PopoverButton
      as={as}
      className={clsx(
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-blue focus-visible:ring-offset-2 rounded-lg",
        className
      )}
    >
      {children}
    </Headless.PopoverButton>
  );
}

type PopoverPanelProps = {
  children: React.ReactNode;
  className?: string;
  anchor?: "bottom" | "bottom start" | "bottom end" | "top" | "top start" | "top end";
};

/**
 * PopoverPanel displays the popover content.
 * Includes transition animations and proper positioning.
 */
export function PopoverPanel({
  children,
  className,
  anchor = "bottom",
}: PopoverPanelProps) {
  return (
    <Headless.PopoverPanel
      transition
      anchor={anchor}
      className={clsx(
        "z-50 mt-2 w-64 origin-top rounded-card p-4",
        "bg-surface border border-hairline shadow-floating",
        "transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0",
        "[--anchor-gap:8px]",
        className
      )}
    >
      {children}
    </Headless.PopoverPanel>
  );
}

/**
 * PopoverGroup allows multiple popovers to share state.
 */
export function PopoverGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Headless.PopoverGroup className={className}>
      {children}
    </Headless.PopoverGroup>
  );
}

/**
 * PopoverBackdrop adds a backdrop when popover is open.
 */
export function PopoverBackdrop({ className }: { className?: string }) {
  return (
    <Headless.PopoverBackdrop
      transition
      className={clsx(
        "fixed inset-0 bg-black/20 dark:bg-black/40",
        "transition duration-100 ease-out data-closed:opacity-0",
        className
      )}
    />
  );
}

/**
 * CloseButton closes the popover when clicked.
 */
export function PopoverClose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Headless.CloseButton className={className}>{children}</Headless.CloseButton>
  );
}
