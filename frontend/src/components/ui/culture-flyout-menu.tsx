"use client";

import { 
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface CultureMenuItem {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface CultureFlyoutMenuProps {
  items: CultureMenuItem[];
  className?: string;
}

export function CultureFlyoutMenu({ items, className }: CultureFlyoutMenuProps) {
  const pathname = usePathname();
  const isActiveSection = items.some(item => pathname === item.href);

  return (
    <Popover className={clsx("relative", className)}>
      <PopoverButton 
        className={clsx(
          "flex items-center gap-x-1 text-sm font-medium border-b-2 px-1 pt-1",
          isActiveSection 
            ? "border-ocean-blue text-text-primary" 
            : "border-transparent text-text-secondary hover:border-border-primary hover:text-text-primary"
        )}
      >
        Culture
        <ChevronDownIcon 
          aria-hidden="true" 
          className="size-5 flex-none text-text-tertiary" 
        />
      </PopoverButton>

      <PopoverPanel
        transition
        className="absolute left-1/2 z-10 mt-8 w-screen max-w-md -translate-x-1/2 overflow-hidden rounded-3xl bg-background-primary shadow-lg ring-1 ring-border-primary transition data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
      >
        <div className="p-3">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "group relative flex items-center gap-x-6 rounded-lg p-3 text-sm/6 hover:bg-background-secondary transition-colors duration-200",
                pathname === item.href && "bg-background-secondary"
              )}
            >
              <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-ocean-blue/10 group-hover:bg-ocean-blue/20 transition-colors duration-200">
                <item.icon 
                  aria-hidden="true" 
                  className={clsx(
                    "size-6 transition-colors duration-200",
                    pathname === item.href 
                      ? "text-ocean-blue" 
                      : "text-text-secondary group-hover:text-ocean-blue"
                  )} 
                />
              </div>
              <div className="flex-auto">
                <div className={clsx(
                  "block font-semibold transition-colors duration-200",
                  pathname === item.href 
                    ? "text-ocean-blue" 
                    : "text-text-primary group-hover:text-ocean-blue"
                )}>
                  {item.name}
                  <span className="absolute inset-0" />
                </div>
                <p className="mt-1 text-text-secondary group-hover:text-text-primary transition-colors duration-200">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </PopoverPanel>
    </Popover>
  );
}