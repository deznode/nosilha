"use client";

import {
  Home,
  Grid3X3,
  BookOpen,
  Map,
  Menu,
  FileText,
  Film,
  User,
  LogIn,
} from "lucide-react";
import clsx from "clsx";

/**
 * Navigation specimen for the design system gallery.
 * Documents the MobileBottomNav pattern (mobile-only component).
 */
export function NavigationSpecimen() {
  // Mock active state for demo
  const activeItem = "Directory";

  const navItems = [
    { label: "Home", icon: Home },
    { label: "Directory", icon: Grid3X3 },
    { label: "Culture", icon: BookOpen },
    { label: "Map", icon: Map },
    { label: "More", icon: Menu },
  ];

  const moreMenuItems = [
    { label: "Stories", icon: FileText },
    { label: "Media", icon: Film },
    { label: "Profile", icon: User },
    { label: "Log in", icon: LogIn },
  ];

  return (
    <div className="space-y-10">
      {/* Overview */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Mobile Bottom Navigation
        </h3>
        <p className="text-muted mb-4 text-sm">
          Fixed bottom navigation bar for mobile devices. Based on the
          &quot;Calm Premium&quot; research pattern for thumb-zone
          accessibility.
        </p>
        <div className="bg-surface-alt rounded-card space-y-2 p-4">
          <div className="flex items-start gap-3">
            <span className="text-valley-green text-lg">✓</span>
            <p className="text-body text-sm">
              <strong>Mobile only</strong> - Hidden on desktop (≥768px)
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-valley-green text-lg">✓</span>
            <p className="text-body text-sm">
              <strong>Safe area aware</strong> - Padding for iOS home indicator
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-valley-green text-lg">✓</span>
            <p className="text-body text-sm">
              <strong>Auto-hides on detail pages</strong> - Directory, story,
              and people detail routes
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-valley-green text-lg">✓</span>
            <p className="text-body text-sm">
              <strong>44px+ touch targets</strong> - WCAG 2.1 AAA compliant
            </p>
          </div>
        </div>
      </div>

      {/* Visual Representation */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Bottom Bar Layout
        </h3>
        <p className="text-muted mb-4 text-sm">
          Visual representation of the bottom navigation bar (actual component
          is fixed to viewport).
        </p>
        <div className="border-hairline rounded-card overflow-hidden border">
          {/* Mock phone frame */}
          <div className="bg-surface-alt p-4 text-center">
            <span className="text-muted text-xs">Page Content Area</span>
          </div>
          {/* Bottom nav mockup */}
          <div className="bg-surface border-hairline border-t">
            <div className="flex h-14 items-center justify-around">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.label === activeItem;
                return (
                  <div
                    key={item.label}
                    className={clsx(
                      "flex flex-col items-center justify-center gap-0.5 px-3 py-2",
                      isActive ? "text-ocean-blue" : "text-muted"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "h-5 w-5",
                        isActive && "fill-ocean-blue/20"
                      )}
                    />
                    <span className="text-[10px] font-medium">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Safe area indicator */}
            <div className="bg-mist-100 dark:bg-basalt-800 h-4" />
          </div>
        </div>
        <p className="text-muted mt-2 text-center text-xs">
          Gray bar represents iOS safe area padding
        </p>
      </div>

      {/* More Menu */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          &quot;More&quot; Menu Popover
        </h3>
        <p className="text-muted mb-4 text-sm">
          Tapping &quot;More&quot; opens a popover with additional navigation
          options.
        </p>
        <div className="flex justify-end">
          <div className="bg-surface border-hairline rounded-card shadow-floating w-56 border p-2">
            {moreMenuItems.slice(0, 2).map((item) => (
              <div
                key={item.label}
                className="text-body hover:bg-surface-alt rounded-button flex items-center gap-3 px-3 py-2.5 text-sm font-medium"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </div>
            ))}
            <div className="border-hairline my-2 border-t" />
            <div className="text-body hover:bg-surface-alt rounded-button flex items-center gap-3 px-3 py-2.5 text-sm font-medium">
              <User className="h-5 w-5" />
              Profile
            </div>
            <div className="border-hairline my-2 border-t" />
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-muted text-sm">Theme</span>
              <div className="bg-surface-alt h-6 w-12 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Active State Matching */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Active State Logic
        </h3>
        <div className="border-hairline bg-surface rounded-card border p-4">
          <div className="space-y-2 font-mono text-sm">
            <div className="text-muted">
              <span className="text-ocean-blue">Home</span>: exact match
              &quot;/&quot;
            </div>
            <div className="text-muted">
              <span className="text-ocean-blue">Directory</span>: startsWith
              &quot;/directory&quot;
            </div>
            <div className="text-muted">
              <span className="text-ocean-blue">Culture</span>: startsWith
              &quot;/history&quot; OR &quot;/people&quot;
            </div>
            <div className="text-muted">
              <span className="text-ocean-blue">Map</span>: exact match
              &quot;/map&quot;
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Routes */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Auto-Hide Routes
        </h3>
        <p className="text-muted mb-4 text-sm">
          Bottom nav hides on detail pages for immersive reading:
        </p>
        <div className="border-hairline bg-surface rounded-card border p-4">
          <div className="space-y-2 font-mono text-sm">
            <div className="text-muted">/directory/[category]/[slug]</div>
            <div className="text-muted">/stories/[slug]</div>
            <div className="text-muted">/people/[slug]</div>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="border-hairline bg-surface rounded-card border p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">Usage</h3>
        <div className="space-y-2">
          <code className="text-muted block text-sm">
            {`import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";`}
          </code>
          <div className="border-hairline my-2 border-t" />
          <code className="text-muted block text-sm">
            {`// In root layout (app/layout.tsx)`}
          </code>
          <code className="text-muted block text-sm">{`<body>`}</code>
          <code className="text-muted block pl-4 text-sm">{`{children}`}</code>
          <code className="text-muted block pl-4 text-sm">
            {`<MobileBottomNav />`}
          </code>
          <code className="text-muted block text-sm">{`</body>`}</code>
        </div>
      </div>
    </div>
  );
}
