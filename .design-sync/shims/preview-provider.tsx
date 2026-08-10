// design-sync preview provider.
//
// Wired via cfg.provider + cfg.extraEntries. Supplies the contexts that
// components in the synced scope read but that a bare preview card has no
// way to provide:
//
//   · QueryClientProvider — BookmarkButton (and therefore DirectoryCard and
//     ListViewCard) calls useIsBookmarked/useToggleBookmark. TanStack Query
//     throws "No QueryClient set" outside a provider.
//   · ToastProvider — useToast() is read by the bookmark and gallery actions.
//
// Auth deliberately gets NO provider: the repo's own useAuth() falls back to
// the zustand authStore when the context is absent, which yields the
// signed-out state — the correct default for a preview card.
//
// Retries and refetching are off so cards render a settled state instead of
// spinning against an API that isn't there.

import React from "react";
import { MotionConfig, MotionGlobalConfig } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/providers/toast-provider";

/*
 * Make every framer-motion animation resolve instantly, at module scope so it
 * is set before any component mounts.
 *
 * This is load-bearing, and the reason is not obvious: package-capture.mjs
 * pins the page clock with `page.clock.setFixedTime(...)` for deterministic
 * screenshots. Time therefore never advances, so a motion animation never
 * progresses past its first frame. Any component that mounts with
 * `initial={{ opacity: 0 }}` and animates in — PageHeader, FeatureCard, the
 * gallery grids, 21 files in all — screenshots at opacity 0 and produces a
 * silently blank card. No error, no console warning.
 *
 * MotionConfig alone does NOT fix it: a zero-duration transition still needs
 * one frame to land, and under a frozen clock that frame never comes.
 * skipAnimations makes motion jump straight to the target values.
 */
MotionGlobalConfig.skipAnimations = true;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: Infinity,
      gcTime: Infinity,
    },
    mutations: { retry: false },
  },
});

/*
 * MotionConfig with a zero-duration transition is what makes motion-driven
 * components visible at all.
 *
 * Many components here mount with `initial={{ opacity: 0, y: 20 }}` and
 * animate in (PageHeader, FeatureCard, the gallery grids — 21 files import
 * framer-motion). A preview screenshot is taken close to mount, so without
 * this they capture at opacity 0 and the card is simply blank — no error, no
 * warning, just an empty preview.
 *
 * It has to live HERE rather than in individual preview files: MotionConfig
 * works through React context, and a preview importing framer-motion directly
 * would pull in a second copy whose context the bundled components never read.
 * This module is merged into the bundle via cfg.extraEntries, so it shares the
 * one instance.
 */
export function DsPreviewProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig transition={{ duration: 0 }} reducedMotion="always">
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </MotionConfig>
  );
}

export default DsPreviewProvider;
