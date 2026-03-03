"use client";

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
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
  isMobile?: boolean;
}

export function CultureFlyoutMenu({
  items,
  className,
  isMobile = false,
}: CultureFlyoutMenuProps) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  // Enhanced keyboard navigation for desktop popover
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!panelRef.current) return;

      const panel = panelRef.current;
      const focusableElements = panel.querySelectorAll("a[href]");
      const currentIndex = Array.from(focusableElements).indexOf(
        document.activeElement as HTMLAnchorElement
      );

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          const nextIndex =
            currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
          (focusableElements[nextIndex] as HTMLElement).focus();
          break;
        case "ArrowUp":
          event.preventDefault();
          const prevIndex =
            currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
          (focusableElements[prevIndex] as HTMLElement).focus();
          break;
      }
    };

    const currentPanel = panelRef.current;
    if (currentPanel) {
      currentPanel.addEventListener("keydown", handleKeyDown);
      return () => {
        currentPanel.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, []);

  // Mobile implementation - always expanded for better UX
  if (isMobile) {
    return (
      <div className="border-ocean-blue/20 from-ocean-blue/5 border-l-4 bg-gradient-to-r to-transparent">
        <div className="text-ocean-blue bg-ocean-blue/10 border-ocean-blue/20 border-b py-3 pr-4 pl-4 text-base font-bold">
          <div className="flex items-center gap-x-2">
            <BookOpenIcon className="h-5 w-5" aria-hidden="true" />
            Culture
          </div>
        </div>
        {items.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={clsx(
              "active:bg-ocean-blue/20 focus:ring-ocean-blue/30 focus:ring-offset-background-primary flex min-h-[48px] items-center gap-x-4 py-4 pr-4 pl-6 text-base transition-all duration-200 ease-out focus:ring-2 focus:ring-offset-2 focus:outline-none active:scale-[0.98]",
              pathname === item.href
                ? "bg-ocean-blue/15 text-ocean-blue border-ocean-blue border-r-4 font-semibold"
                : "text-text-secondary hover:bg-ocean-blue/10 hover:text-text-primary focus:bg-ocean-blue/10 focus:text-text-primary"
            )}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            <div
              className={clsx(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                pathname === item.href
                  ? "bg-ocean-blue/20 text-ocean-blue"
                  : "bg-background-secondary text-text-tertiary group-hover:bg-ocean-blue/10 group-hover:text-ocean-blue"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div
                className={clsx(
                  "truncate font-medium",
                  pathname === item.href ? "text-ocean-blue" : ""
                )}
              >
                {item.name}
              </div>
              <p className="text-text-tertiary mt-0.5 truncate text-sm">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  // Desktop implementation using Popover (existing implementation)
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <PopoverButton
            className={clsx(
              "group focus:ring-ocean-blue/20 focus:ring-offset-background-primary inline-flex h-16 items-center gap-x-1 transition-all duration-200 ease-out focus:ring-2 focus:ring-offset-2 focus:outline-none",
              className
            )}
            aria-expanded={open}
            aria-haspopup="true"
            aria-label="Culture menu - explore Brava's history, people, and photo galleries"
          >
            Culture
            <ChevronDownIcon
              aria-hidden="true"
              className={clsx(
                "text-text-tertiary group-hover:text-text-secondary size-5 flex-none transition-transform duration-200 ease-out",
                open && "rotate-180"
              )}
            />
          </PopoverButton>

          <PopoverPanel
            ref={panelRef}
            transition
            className="bg-background-primary ring-border-primary absolute left-1/2 z-50 mt-3 w-screen max-w-md -translate-x-1/2 overflow-hidden rounded-3xl shadow-2xl ring-1 backdrop-blur-sm transition data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
            role="menu"
            aria-label="Culture navigation menu"
          >
            <div className="p-4">
              {items.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  role="menuitem"
                  tabIndex={-1}
                  aria-describedby={`culture-item-${index}-desc`}
                  className={clsx(
                    "group focus:ring-ocean-blue/30 focus:ring-offset-background-primary focus:bg-ocean-blue/5 relative flex items-center gap-x-6 rounded-xl p-4 text-sm/6 transition-all duration-300 ease-out focus:ring-2 focus:ring-offset-2 focus:outline-none",
                    "hover:bg-background-secondary hover:scale-[1.02] hover:shadow-sm active:scale-[0.98]",
                    pathname === item.href &&
                      "bg-ocean-blue/10 ring-ocean-blue/20 ring-1"
                  )}
                >
                  <div
                    className={clsx(
                      "flex size-12 flex-none items-center justify-center rounded-xl transition-all duration-300 ease-out",
                      pathname === item.href
                        ? "bg-ocean-blue/20 scale-105"
                        : "bg-ocean-blue/10 group-hover:bg-ocean-blue/25 group-focus:bg-ocean-blue/25 group-hover:scale-110 group-focus:scale-110"
                    )}
                  >
                    <item.icon
                      aria-hidden="true"
                      className={clsx(
                        "size-6 transition-all duration-300 ease-out",
                        pathname === item.href
                          ? "text-ocean-blue scale-110"
                          : "text-text-secondary group-hover:text-ocean-blue group-focus:text-ocean-blue group-hover:scale-110 group-focus:scale-110"
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-auto">
                    <div
                      className={clsx(
                        "block truncate text-base font-semibold transition-all duration-300 ease-out",
                        pathname === item.href
                          ? "text-ocean-blue"
                          : "text-text-primary group-hover:text-ocean-blue group-focus:text-ocean-blue"
                      )}
                    >
                      {item.name}
                      <span className="absolute inset-0" />
                    </div>
                    <p
                      id={`culture-item-${index}-desc`}
                      className={clsx(
                        "mt-1 text-sm leading-relaxed transition-all duration-300 ease-out",
                        pathname === item.href
                          ? "text-text-primary"
                          : "text-text-secondary group-hover:text-text-primary group-focus:text-text-primary"
                      )}
                    >
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
}
