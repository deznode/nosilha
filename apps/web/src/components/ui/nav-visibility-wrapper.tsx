"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { useScrollDirection } from "@/lib/hooks/use-scroll-direction";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

interface NavVisibilityWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps StickyNav to hide on scroll-down and show on scroll-up (mobile only).
 * Sets CSS custom property `--nav-offset` so sticky children can track position.
 */
export function NavVisibilityWrapper({
  children,
  className,
}: NavVisibilityWrapperProps) {
  const direction = useScrollDirection(10);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const hidden = isMobile && direction === "down";
  const navOffset = hidden ? "0px" : "64px";

  return (
    <div
      className={clsx(className)}
      style={{ "--nav-offset": navOffset } as React.CSSProperties}
    >
      <div
        className={clsx(
          "transition-transform duration-300",
          hidden ? "-translate-y-full" : "translate-y-0"
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {children}
      </div>
    </div>
  );
}
