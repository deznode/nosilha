"use client";

import * as React from "react";
import { useRef, useState, useEffect, useCallback } from "react";
import { clsx } from "clsx";

interface ExpandableTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  lines?: 2 | 3 | 4;
  textClassName?: string;
  buttonClassName?: string;
}

const lineClampClass = {
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
} as const;

export const ExpandableText = React.forwardRef<
  HTMLDivElement,
  ExpandableTextProps
>(
  (
    { text, lines = 3, textClassName, buttonClassName, className, ...props },
    ref
  ) => {
    const textRef = useRef<HTMLParagraphElement>(null);
    const [expanded, setExpanded] = useState(false);
    const [needsTruncation, setNeedsTruncation] = useState(false);

    // Reset expanded state when text changes (e.g. lightbox navigation)
    const [prevText, setPrevText] = useState(text);
    if (prevText !== text) {
      setPrevText(text);
      setExpanded(false);
    }

    const checkOverflow = useCallback(() => {
      const el = textRef.current;
      if (!el) return;
      setNeedsTruncation(el.scrollHeight > el.clientHeight + 1);
    }, []);

    useEffect(() => {
      if (expanded) return;
      checkOverflow();

      const el = textRef.current;
      if (!el) return;

      const observer = new ResizeObserver(checkOverflow);
      observer.observe(el);
      return () => observer.disconnect();
    }, [checkOverflow, text, expanded]);

    return (
      <div ref={ref} className={className} {...props}>
        <p
          ref={textRef}
          className={clsx(textClassName, !expanded && lineClampClass[lines])}
        >
          {text}
        </p>
        {(needsTruncation || expanded) && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className={clsx(
              "mt-1 text-sm font-medium transition-colors duration-200",
              buttonClassName
            )}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    );
  }
);
ExpandableText.displayName = "ExpandableText";
