"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebarCollapsed, useUiStore } from "@/stores/uiStore";
import { Tooltip } from "@/components/ui/tooltip";
import { NosilhaLogo } from "@/components/ui/logo";
import {
  adminNavSections,
  adminNavItems,
  type AdminNavItem,
} from "./admin-nav-config";

export function AdminSidebar() {
  const pathname = usePathname();
  const collapsed = useSidebarCollapsed();
  const toggleSidebarCollapsed = useUiStore(
    (state) => state.toggleSidebarCollapsed
  );

  const isActive = (item: AdminNavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <nav
      aria-label="Admin navigation"
      className={clsx(
        "flex h-full flex-col bg-surface border-r border-hairline transition-[width] duration-300 ease-calm",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo / Branding */}
      <div
        className={clsx(
          "flex h-14 shrink-0 items-center border-b border-hairline",
          collapsed ? "justify-center px-2" : "px-4"
        )}
      >
        {collapsed ? (
          <NosilhaLogo size="compact" instanceId="admin-sidebar" className="scale-75" />
        ) : (
          <NosilhaLogo size="compact" instanceId="admin-sidebar" />
        )}
      </div>

      {/* Nav Sections */}
      <div className="flex-1 overflow-y-auto py-2">
        {adminNavSections.map((section) => {
          const sectionItems = adminNavItems.filter(
            (item) => item.section === section.id
          );
          if (sectionItems.length === 0) return null;

          return (
            <div key={section.id} className="mb-1">
              {/* Section Header */}
              {section.label && !collapsed && (
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted">
                  {section.label}
                </div>
              )}
              {section.label && collapsed && (
                <div className="mx-3 my-2 border-t border-hairline" />
              )}

              {/* Nav Items */}
              {sectionItems.map((item) => {
                const active = isActive(item);
                const Icon = item.icon;

                const itemContent = (
                  <div
                    className={clsx(
                      "flex items-center gap-3 rounded-button px-3 py-2 text-sm font-medium transition-colors",
                      collapsed && "justify-center px-2",
                      active && "bg-ocean-blue/10 text-ocean-blue",
                      !active &&
                        !item.disabled &&
                        "text-body hover:bg-surface-alt",
                      item.disabled && "opacity-50 cursor-not-allowed text-muted"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                );

                if (item.disabled) {
                  return (
                    <div key={item.href} className="mx-2">
                      <Tooltip
                        content="Coming soon"
                        position={collapsed ? "right" : "top"}
                      >
                        <span>{itemContent}</span>
                      </Tooltip>
                    </div>
                  );
                }

                if (collapsed) {
                  return (
                    <div key={item.href} className="mx-2">
                      <Tooltip content={item.label} position="right">
                        <Link href={item.href}>{itemContent}</Link>
                      </Tooltip>
                    </div>
                  );
                }

                return (
                  <div key={item.href} className="mx-2">
                    <Link href={item.href}>{itemContent}</Link>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Collapse Toggle */}
      <div className="shrink-0 border-t border-hairline p-2">
        <button
          onClick={toggleSidebarCollapsed}
          className={clsx(
            "flex w-full items-center gap-3 rounded-button px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-alt hover:text-body",
            collapsed && "justify-center px-2"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5 shrink-0" />
          ) : (
            <>
              <PanelLeftClose className="h-5 w-5 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
}
