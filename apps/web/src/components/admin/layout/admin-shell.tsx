"use client";

import clsx from "clsx";
import { useSidebarOpen, useUiStore } from "@/stores/uiStore";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopBar } from "./admin-top-bar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useSidebarOpen();
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

  return (
    <div className="bg-canvas flex h-screen overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          "ease-calm fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AdminSidebar />
      </div>

      {/* Content column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
