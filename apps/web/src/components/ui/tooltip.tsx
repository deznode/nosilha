"use client";

import * as Headless from "@headlessui/react";
import clsx from "clsx";
import React, { useState } from "react";

type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
};

const positionStyles = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrowStyles = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-basalt-900 dark:border-t-basalt-700 border-x-transparent border-b-transparent",
  bottom:
    "bottom-full left-1/2 -translate-x-1/2 border-b-basalt-900 dark:border-b-basalt-700 border-x-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 border-l-basalt-900 dark:border-l-basalt-700 border-y-transparent border-r-transparent",
  right:
    "right-full top-1/2 -translate-y-1/2 border-r-basalt-900 dark:border-r-basalt-700 border-y-transparent border-l-transparent",
};

/**
 * Tooltip component for simple text hints on hover.
 * Uses HeadlessUI for accessibility and proper focus management.
 */
export function Tooltip({
  content,
  children,
  position = "top",
  className,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      {children}
      <Headless.Transition
        show={isOpen}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <span
          role="tooltip"
          className={clsx(
            "shadow-elevated absolute z-50 rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap",
            "bg-basalt-900 dark:bg-basalt-700 text-white",
            positionStyles[position],
            className
          )}
        >
          {content}
          <span className={clsx("absolute border-4", arrowStyles[position])} />
        </span>
      </Headless.Transition>
    </span>
  );
}

/**
 * TooltipTrigger for custom trigger elements.
 * Wraps children and manages tooltip state via context.
 */
export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
