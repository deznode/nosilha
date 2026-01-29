"use client";

import {
  Tab as HeadlessTab,
  TabGroup as HeadlessTabGroup,
  TabList as HeadlessTabList,
  TabPanel as HeadlessTabPanel,
  TabPanels as HeadlessTabPanels,
} from "@headlessui/react";
import clsx from "clsx";
import type { ReactNode, ComponentPropsWithoutRef } from "react";
import type { LucideIcon } from "lucide-react";

// Color variants for tab underlines
const colorStyles = {
  blue: {
    active: "border-ocean-blue text-ocean-blue",
    inactive: "hover:border-ocean-blue/30",
  },
  pink: {
    active: "border-bougainvillea-pink text-bougainvillea-pink",
    inactive: "hover:border-bougainvillea-pink/30",
  },
  green: {
    active: "border-valley-green text-valley-green",
    inactive: "hover:border-valley-green/30",
  },
  ochre: {
    active: "border-sobrado-ochre text-sobrado-ochre",
    inactive: "hover:border-sobrado-ochre/30",
  },
} as const;

export type TabColor = keyof typeof colorStyles;

// TabGroup props
interface TabGroupProps {
  children: ReactNode;
  onChange?: (index: number) => void;
  defaultIndex?: number;
  selectedIndex?: number;
  className?: string;
}

export function TabGroup({
  children,
  onChange,
  defaultIndex = 0,
  selectedIndex,
  className,
}: TabGroupProps) {
  return (
    <HeadlessTabGroup
      defaultIndex={defaultIndex}
      selectedIndex={selectedIndex}
      onChange={onChange}
      className={className}
    >
      {children}
    </HeadlessTabGroup>
  );
}

// TabList props
interface TabListProps {
  children: ReactNode;
  className?: string;
}

export function TabList({ children, className }: TabListProps) {
  return (
    <div className="border-hairline border-b">
      <HeadlessTabList
        className={clsx(
          "-mb-px flex space-x-4 overflow-x-auto md:space-x-8",
          className
        )}
      >
        {children}
      </HeadlessTabList>
    </div>
  );
}

// Tab props
interface TabProps {
  children: ReactNode;
  icon?: LucideIcon;
  badge?: number | string;
  color?: TabColor;
  className?: string;
}

export function Tab({
  children,
  icon: Icon,
  badge,
  color = "blue",
  className,
}: TabProps) {
  const colorStyle = colorStyles[color];

  return (
    <HeadlessTab
      className={({ selected }) =>
        clsx(
          "flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors",
          "focus-visible:ring-ocean-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          selected
            ? colorStyle.active
            : clsx(
                "text-muted hover:text-body border-transparent",
                colorStyle.inactive
              ),
          className
        )
      }
    >
      {Icon && <Icon data-slot="icon" size={16} />}
      {children}
      {badge !== undefined && badge !== 0 && (
        <span className="ml-1 inline-flex items-center rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          {badge}
        </span>
      )}
    </HeadlessTab>
  );
}

// TabPanels props
interface TabPanelsProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
}

export function TabPanels({ children, className, ...props }: TabPanelsProps) {
  return (
    <HeadlessTabPanels className={className} {...props}>
      {children}
    </HeadlessTabPanels>
  );
}

// TabPanel props
interface TabPanelProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
}

export function TabPanel({ children, className, ...props }: TabPanelProps) {
  return (
    <HeadlessTabPanel
      className={clsx("focus:outline-none", className)}
      {...props}
    >
      {children}
    </HeadlessTabPanel>
  );
}
