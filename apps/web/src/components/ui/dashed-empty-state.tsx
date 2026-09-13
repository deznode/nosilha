import * as React from "react";
import clsx from "clsx";

interface DashedEmptyStateProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title: React.ReactNode;
  description: React.ReactNode;
  /** Buttons or links offering the next step. */
  actions?: React.ReactNode;
  titleAs?: "h2" | "h3" | "h4";
}

/**
 * The designed state for something the archive holds nothing about.
 *
 * A dashed outline on the page background, never a filled grey box — most settlements
 * have no records, so this is the screen they see, not an edge case. Spec 033 FR-006.
 */
export const DashedEmptyState = React.forwardRef<
  HTMLDivElement,
  DashedEmptyStateProps
>(
  (
    { title, description, actions, titleAs: Title = "h3", className, ...props },
    ref
  ) => (
    <div
      ref={ref}
      className={clsx(
        "border-border-strong max-w-[600px] rounded-xl border-[1.5px] border-dashed px-8 py-[30px]",
        className
      )}
      {...props}
    >
      <Title className="text-foreground mb-[7px] text-[15px] font-semibold">
        {title}
      </Title>
      <p className="text-muted-foreground text-[13.5px] leading-[1.65]">
        {description}
      </p>
      {actions && (
        <div
          data-empty-state-actions
          className="mt-[18px] flex flex-wrap gap-2.5"
        >
          {actions}
        </div>
      )}
    </div>
  )
);
DashedEmptyState.displayName = "DashedEmptyState";
