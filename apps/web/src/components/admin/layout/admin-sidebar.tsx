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
        "bg-surface border-hairline ease-calm flex h-full flex-col border-r transition-[width] duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo / Branding */}
      <div
        className={clsx(
          "border-hairline flex h-14 shrink-0 items-center border-b",
          collapsed ? "justify-center px-2" : "px-4"
        )}
      >
        <Link href="/">
          <NosilhaLogo
            size="sidebar"
            iconOnly={collapsed}
            instanceId="admin-sidebar"
          />
        </Link>
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
              {section.label &&
                (collapsed ? (
                  <div className="border-hairline mx-3 my-2 border-t" />
                ) : (
                  <div className="text-muted px-4 py-2 text-xs font-semibold tracking-wider uppercase">
                    {section.label}
                  </div>
                ))}

              {/* Nav Items */}
              {sectionItems.map((item) => {
                const active = isActive(item);
                const Icon = item.icon;

                const itemContent = (
                  <div
                    className={clsx(
                      "rounded-button flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors",
                      collapsed && "justify-center px-2",
                      active && "bg-ocean-blue/10 text-ocean-blue",
                      !active &&
                        !item.disabled &&
                        "text-body hover:bg-surface-alt",
                      item.disabled &&
                        "text-muted cursor-not-allowed opacity-50"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                );

                function renderNavItem(): React.ReactNode {
                  if (item.disabled) {
                    return (
                      <Tooltip
                        content="Coming soon"
                        position={collapsed ? "right" : "top"}
                      >
                        <span>{itemContent}</span>
                      </Tooltip>
                    );
                  }

                  if (collapsed) {
                    return (
                      <Tooltip content={item.label} position="right">
                        <Link href={item.href}>{itemContent}</Link>
                      </Tooltip>
                    );
                  }

                  return <Link href={item.href}>{itemContent}</Link>;
                }

                return (
                  <div key={item.href} className="mx-2">
                    {renderNavItem()}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Collapse Toggle */}
      <div className="border-hairline shrink-0 border-t p-2">
        <button
          onClick={toggleSidebarCollapsed}
          className={clsx(
            "rounded-button text-muted hover:bg-surface-alt hover:text-body flex w-full items-center gap-3 px-3 py-2 text-sm font-medium transition-colors",
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
