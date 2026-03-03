"use client";

import { DirectoryCardSkeleton } from "@/components/ui/directory-card-skeleton";
import { LoadingPulse } from "@/components/ui/loading-spinner";
import { Card } from "@/components/ui/card";

/**
 * Skeleton specimen for the design system gallery.
 * Showcases skeleton loading patterns for content placeholders.
 */
export function SkeletonSpecimen() {
  return (
    <div className="space-y-10">
      {/* DirectoryCardSkeleton */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          DirectoryCardSkeleton
        </h3>
        <p className="text-muted mb-4 text-sm">
          Skeleton that matches DirectoryCard layout structure. Uses semantic
          color tokens that automatically adapt to light/dark mode.
        </p>
        <div className="grid max-w-md grid-cols-1 gap-4">
          <DirectoryCardSkeleton />
        </div>
      </div>

      {/* Generic Skeleton Patterns */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Generic Skeleton Patterns
        </h3>
        <p className="text-muted mb-4 text-sm">
          Build custom skeletons using <code>animate-pulse</code> with{" "}
          <code>bg-background-tertiary</code> for the shimmer effect.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Text Lines Skeleton */}
          <Card className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="bg-background-tertiary h-4 w-3/4 rounded" />
              <div className="bg-background-tertiary h-4 w-full rounded" />
              <div className="bg-background-tertiary h-4 w-5/6 rounded" />
              <div className="bg-background-tertiary h-4 w-2/3 rounded" />
            </div>
            <p className="text-muted mt-3 text-xs">Text paragraph skeleton</p>
          </Card>

          {/* Profile Skeleton */}
          <Card className="p-4">
            <div className="flex animate-pulse items-center gap-4">
              <div className="bg-background-tertiary h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="bg-background-tertiary h-4 w-1/2 rounded" />
                <div className="bg-background-tertiary h-3 w-3/4 rounded" />
              </div>
            </div>
            <p className="text-muted mt-3 text-xs">Profile/avatar skeleton</p>
          </Card>

          {/* Media + Text Skeleton */}
          <Card className="p-4">
            <div className="flex animate-pulse gap-4">
              <div className="bg-background-tertiary h-20 w-20 flex-shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="bg-background-tertiary h-4 w-3/4 rounded" />
                <div className="bg-background-tertiary h-3 w-full rounded" />
                <div className="bg-background-tertiary h-3 w-1/2 rounded" />
              </div>
            </div>
            <p className="text-muted mt-3 text-xs">Media card skeleton</p>
          </Card>

          {/* List Item Skeleton */}
          <Card className="p-4">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="bg-background-tertiary h-8 w-8 rounded" />
                  <div className="bg-background-tertiary h-4 flex-1 rounded" />
                </div>
              ))}
            </div>
            <p className="text-muted mt-3 text-xs">List items skeleton</p>
          </Card>
        </div>
      </div>

      {/* LoadingPulse Wrapper */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          LoadingPulse Wrapper
        </h3>
        <p className="text-muted mb-4 text-sm">
          LoadingPulse wraps content with a subtle pulse animation. Useful for
          indicating loading state on any element.
        </p>
        <div className="flex flex-wrap gap-4">
          <LoadingPulse className="bg-surface-alt rounded-card inline-block px-6 py-3">
            <span className="text-muted text-sm">Loading content...</span>
          </LoadingPulse>
          <LoadingPulse className="bg-surface-alt inline-block rounded-full px-4 py-2">
            <span className="text-muted text-sm">Processing</span>
          </LoadingPulse>
        </div>
      </div>

      {/* Best Practices */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Skeleton Best Practices
        </h3>
        <div className="bg-surface-alt rounded-card space-y-3 p-4">
          <div className="flex items-start gap-3">
            <span className="text-valley-green text-lg">✓</span>
            <p className="text-body text-sm">
              <strong>Match the layout</strong> - Skeleton should mirror the
              actual content structure to prevent layout shift
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-valley-green text-lg">✓</span>
            <p className="text-body text-sm">
              <strong>Use semantic tokens</strong> -{" "}
              <code>bg-background-tertiary</code> adapts to dark mode
              automatically
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-valley-green text-lg">✓</span>
            <p className="text-body text-sm">
              <strong>Add ARIA labels</strong> - Include{" "}
              <code>aria-label=&quot;Loading...&quot;</code> for screen readers
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-status-error text-lg">✗</span>
            <p className="text-body text-sm">
              <strong>Avoid layout shift</strong> - Never return{" "}
              <code>null</code> while loading; always show a skeleton
            </p>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="border-hairline bg-surface rounded-card border p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">Usage</h3>
        <div className="space-y-2">
          <code className="text-muted block text-sm">
            {`import { DirectoryCardSkeleton } from "@/components/ui/directory-card-skeleton";`}
          </code>
          <code className="text-muted block text-sm">
            {`import { LoadingPulse } from "@/components/ui/loading-spinner";`}
          </code>
          <div className="border-hairline my-2 border-t" />
          <code className="text-muted block text-sm">
            {`// Pre-built skeleton`}
          </code>
          <code className="text-muted block text-sm">
            {`<DirectoryCardSkeleton />`}
          </code>
          <div className="border-hairline my-2 border-t" />
          <code className="text-muted block text-sm">
            {`// Custom skeleton with animate-pulse`}
          </code>
          <code className="text-muted block text-sm">
            {`<div className="animate-pulse">`}
          </code>
          <code className="text-muted block pl-4 text-sm">
            {`<div className="bg-background-tertiary h-4 w-3/4 rounded" />`}
          </code>
          <code className="text-muted block text-sm">{`</div>`}</code>
        </div>
      </div>
    </div>
  );
}
