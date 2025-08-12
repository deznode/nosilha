"use client";

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
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
}

export function CultureFlyoutMenu({
  items,
  className,
}: CultureFlyoutMenuProps) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  // Enhanced keyboard navigation
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

  return (
    <Popover className={clsx("relative", className)}>
      {({ open }) => (
        <>
          <PopoverButton
            className="group flex items-center gap-x-1 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-ocean-blue/20 focus:ring-offset-2 focus:ring-offset-background-primary"
            aria-expanded={open}
            aria-haspopup="true"
            aria-label="Culture menu - explore Brava's history, people, and photo galleries"
          >
            Culture
            <ChevronDownIcon
              aria-hidden="true"
              className={clsx(
                "size-5 flex-none text-text-tertiary transition-transform duration-200 ease-out group-hover:text-text-secondary",
                open && "rotate-180"
              )}
            />
          </PopoverButton>

          <PopoverPanel
            ref={panelRef}
            transition
            className="absolute left-1/2 z-50 mt-3 w-screen max-w-md -translate-x-1/2 overflow-hidden rounded-3xl bg-background-primary shadow-2xl ring-1 ring-border-primary transition data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in backdrop-blur-sm"
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
                    "group relative flex items-center gap-x-6 rounded-xl p-4 text-sm/6 transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-ocean-blue/30 focus:ring-offset-2 focus:ring-offset-background-primary focus:bg-ocean-blue/5",
                    "hover:bg-background-secondary hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]",
                    pathname === item.href &&
                      "bg-ocean-blue/10 ring-1 ring-ocean-blue/20"
                  )}
                >
                  <div
                    className={clsx(
                      "flex size-12 flex-none items-center justify-center rounded-xl transition-all duration-300 ease-out",
                      pathname === item.href
                        ? "bg-ocean-blue/20 scale-105"
                        : "bg-ocean-blue/10 group-hover:bg-ocean-blue/25 group-hover:scale-110 group-focus:bg-ocean-blue/25 group-focus:scale-110"
                    )}
                  >
                    <item.icon
                      aria-hidden="true"
                      className={clsx(
                        "size-6 transition-all duration-300 ease-out",
                        pathname === item.href
                          ? "text-ocean-blue scale-110"
                          : "text-text-secondary group-hover:text-ocean-blue group-hover:scale-110 group-focus:text-ocean-blue group-focus:scale-110"
                      )}
                    />
                  </div>
                  <div className="flex-auto min-w-0">
                    <div
                      className={clsx(
                        "block font-semibold text-base transition-all duration-300 ease-out truncate",
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
