"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

interface NavItem {
  id: string;
  label: string;
}

const navItems: NavItem[] = [
  // Foundations
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "spacing", label: "Spacing" },
  { id: "shadows", label: "Shadows" },
  { id: "radii", label: "Border Radius" },
  // Components
  { id: "buttons", label: "Buttons" },
  { id: "inputs", label: "Inputs" },
  { id: "checkboxes", label: "Checkboxes" },
  { id: "feedback", label: "Feedback" },
  { id: "cards", label: "Cards" },
  { id: "badges", label: "Badges" },
  { id: "toasts", label: "Toasts" },
  { id: "dialogs", label: "Dialogs" },
  { id: "skeletons", label: "Skeletons" },
  { id: "avatars", label: "Avatars" },
  { id: "overlays", label: "Overlays" },
  // Layout & Navigation
  { id: "page-header", label: "Page Header" },
  { id: "navigation", label: "Navigation" },
  { id: "toolbar", label: "Toolbar" },
  { id: "tabs", label: "Tabs" },
  { id: "pagination", label: "Pagination" },
];

/**
 * Gallery navigation component.
 * - Desktop (lg+): Sticky sidebar
 * - Mobile: Horizontal scroll tabs
 *
 * Uses Intersection Observer for active section highlighting.
 */
export function GalleryNav() {
  const [activeSection, setActiveSection] = useState<string>("colors");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      }
    );

    navItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Mobile: Horizontal scroll tabs */}
      <nav
        className="border-hairline bg-surface/95 sticky top-16 z-30 -mx-4 border-b px-4 py-3 backdrop-blur-sm lg:hidden"
        aria-label="Design system sections"
      >
        <ul className="scrollbar-hide flex gap-2 overflow-x-auto">
          {navItems.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => handleClick(id)}
                className={clsx(
                  "rounded-button px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  activeSection === id
                    ? "bg-ocean-blue text-white"
                    : "bg-surface-alt text-basalt-600 dark:text-basalt-400 hover:text-body"
                )}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Desktop: Sticky sidebar */}
      <nav
        className="top-24 hidden h-fit lg:sticky lg:block lg:w-48"
        aria-label="Design system sections"
      >
        <ul className="space-y-1">
          {navItems.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => handleClick(id)}
                className={clsx(
                  "ease-calm rounded-button block w-full px-4 py-2 text-left text-sm font-medium transition-all",
                  activeSection === id
                    ? "bg-ocean-blue/10 text-ocean-blue dark:bg-ocean-blue/20 dark:text-ocean-blue-light"
                    : "text-basalt-600 dark:text-basalt-400 hover:bg-surface-alt hover:text-body"
                )}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
