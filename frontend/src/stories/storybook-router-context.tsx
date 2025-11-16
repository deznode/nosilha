"use client";

import type { ReactNode } from "react";
import {
  AppRouterContext,
  type AppRouterInstance,
} from "next/dist/shared/lib/app-router-context.shared-runtime";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";

const mockRouter: AppRouterInstance = {
  back: () => {},
  forward: () => {},
  refresh: () => {},
  push: () => {},
  replace: () => {},
  prefetch: () => {},
};

export function StorybookRouterProvider({
  children,
  pathname = "/",
}: {
  children: ReactNode;
  pathname?: string;
}) {
  return (
    <AppRouterContext.Provider value={mockRouter}>
      <PathnameContext.Provider value={pathname}>
        {children}
      </PathnameContext.Provider>
    </AppRouterContext.Provider>
  );
}
