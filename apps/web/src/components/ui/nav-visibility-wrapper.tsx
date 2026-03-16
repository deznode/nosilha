"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { useNavHidden } from "@/lib/hooks/use-nav-hidden";

interface NavVisibilityWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps StickyNav to hide on scroll-down and show on scroll-up (mobile only).
 * Only applies -translate-y-full when hiding to avoid creating a containing
 * block that would break StickyNav's position: fixed.
 */
export function NavVisibilityWrapper({
  children,
  className,
}: NavVisibilityWrapperProps) {
  const hidden = useNavHidden();

  return (
    <div className={clsx(className)}>
      <div
        className={clsx(
          "transition-transform duration-300",
          hidden && "-translate-y-full"
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {children}
      </div>
    </div>
  );
}
