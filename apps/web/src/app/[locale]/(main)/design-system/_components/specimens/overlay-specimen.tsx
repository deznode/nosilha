"use client";

import { Fragment } from "react";
import { Tooltip } from "@/components/ui/tooltip";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@/components/catalyst-ui/popover";
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
  DropdownDivider,
  DropdownLabel,
  DropdownShortcut,
} from "@/components/catalyst-ui/dropdown";
import { AnimatedButton } from "@/components/ui/animated-button";
import {
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Share,
  Download,
  Star,
  Settings,
  LogOut,
  User,
  Bell,
  HelpCircle,
  Info,
} from "lucide-react";

/**
 * Overlay specimen for the design system gallery.
 * Showcases Tooltip, Popover, and Dropdown components using HeadlessUI.
 */
export function OverlaySpecimen() {
  return (
    <div className="space-y-10">
      {/* Tooltips */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Tooltips
        </h3>
        <p className="text-muted mb-6 text-sm">
          Simple text hints that appear on hover/focus. Position variants
          available.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          <Tooltip content="Tooltip above" position="top">
            <button className="rounded-button bg-surface-alt hover:bg-surface border-hairline border px-4 py-2 text-sm">
              Top
            </button>
          </Tooltip>
          <Tooltip content="Tooltip below" position="bottom">
            <button className="rounded-button bg-surface-alt hover:bg-surface border-hairline border px-4 py-2 text-sm">
              Bottom
            </button>
          </Tooltip>
          <Tooltip content="Tooltip left" position="left">
            <button className="rounded-button bg-surface-alt hover:bg-surface border-hairline border px-4 py-2 text-sm">
              Left
            </button>
          </Tooltip>
          <Tooltip content="Tooltip right" position="right">
            <button className="rounded-button bg-surface-alt hover:bg-surface border-hairline border px-4 py-2 text-sm">
              Right
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Tooltip Use Cases */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Tooltip Use Cases
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <Tooltip content="Edit this entry">
            <button className="rounded-button hover:bg-surface-alt p-2">
              <Edit className="text-muted h-5 w-5" />
            </button>
          </Tooltip>
          <Tooltip content="Copy to clipboard">
            <button className="rounded-button hover:bg-surface-alt p-2">
              <Copy className="text-muted h-5 w-5" />
            </button>
          </Tooltip>
          <Tooltip content="Share via link">
            <button className="rounded-button hover:bg-surface-alt p-2">
              <Share className="text-muted h-5 w-5" />
            </button>
          </Tooltip>
          <Tooltip content="Learn more about this feature">
            <button className="rounded-button hover:bg-surface-alt p-2">
              <HelpCircle className="text-muted h-5 w-5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Popovers */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Popovers
        </h3>
        <p className="text-muted mb-6 text-sm">
          Rich content panels that open on click. Auto-positioning with anchor
          variants.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Popover>
            <PopoverButton as={Fragment}>
              <AnimatedButton variant="secondary" size="sm">
                <Info className="mr-2 h-4 w-4" />
                More Info
              </AnimatedButton>
            </PopoverButton>
            <PopoverPanel anchor="bottom start">
              <h4 className="text-body mb-2 font-semibold">
                About This Feature
              </h4>
              <p className="text-muted text-sm">
                Popovers can contain any content including text, forms, images,
                and interactive elements.
              </p>
              <div className="border-hairline mt-4 flex gap-2 border-t pt-4">
                <AnimatedButton variant="primary" size="sm">
                  Got it
                </AnimatedButton>
                <AnimatedButton variant="ghost" size="sm">
                  Learn more
                </AnimatedButton>
              </div>
            </PopoverPanel>
          </Popover>

          <Popover>
            <PopoverButton as={Fragment}>
              <AnimatedButton variant="secondary" size="sm">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </AnimatedButton>
            </PopoverButton>
            <PopoverPanel anchor="bottom" className="w-72">
              <h4 className="text-body mb-3 font-semibold">Recent Activity</h4>
              <div className="space-y-3">
                {[
                  { text: "New comment on your story", time: "2m ago" },
                  { text: "Maria liked your photo", time: "1h ago" },
                  { text: "Your submission was approved", time: "3h ago" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="hover:bg-surface-alt rounded-button -mx-2 cursor-pointer px-2 py-2"
                  >
                    <p className="text-body text-sm">{item.text}</p>
                    <p className="text-muted text-xs">{item.time}</p>
                  </div>
                ))}
              </div>
              <div className="border-hairline mt-3 border-t pt-3">
                <button className="text-ocean-blue text-sm font-medium hover:underline">
                  View all notifications
                </button>
              </div>
            </PopoverPanel>
          </Popover>
        </div>
      </div>

      {/* Dropdowns */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Dropdown Menus
        </h3>
        <p className="text-muted mb-6 text-sm">
          Action menus with items, dividers, icons, and keyboard shortcuts.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          {/* Basic Dropdown */}
          <Dropdown>
            <DropdownButton as={Fragment}>
              <AnimatedButton variant="secondary" size="sm">
                Actions
                <MoreVertical className="ml-2 h-4 w-4" />
              </AnimatedButton>
            </DropdownButton>
            <DropdownMenu>
              <DropdownItem onClick={() => {}}>
                <Edit className="text-muted h-4 w-4" />
                Edit
                <DropdownShortcut keys="⌘E" />
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                <Copy className="text-muted h-4 w-4" />
                Duplicate
                <DropdownShortcut keys="⌘D" />
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                <Download className="text-muted h-4 w-4" />
                Download
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={() => {}} destructive>
                <Trash2 className="h-4 w-4" />
                Delete
                <DropdownShortcut keys="⌘⌫" />
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          {/* Grouped Dropdown */}
          <Dropdown>
            <DropdownButton as={Fragment}>
              <AnimatedButton variant="secondary" size="sm">
                <User className="mr-2 h-4 w-4" />
                Account
              </AnimatedButton>
            </DropdownButton>
            <DropdownMenu>
              <DropdownLabel>Signed in as João</DropdownLabel>
              <DropdownItem href="/profile">
                <User className="text-muted h-4 w-4" />
                Profile
              </DropdownItem>
              <DropdownItem href="/settings">
                <Settings className="text-muted h-4 w-4" />
                Settings
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                <Star className="text-muted h-4 w-4" />
                Favorites
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={() => {}}>
                <LogOut className="text-muted h-4 w-4" />
                Sign out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          {/* Icon Button Dropdown */}
          <Dropdown>
            <DropdownButton className="hover:bg-surface-alt rounded-full p-2">
              <MoreVertical className="text-muted h-5 w-5" />
            </DropdownButton>
            <DropdownMenu>
              <DropdownItem onClick={() => {}}>
                <Share className="text-muted h-4 w-4" />
                Share
              </DropdownItem>
              <DropdownItem onClick={() => {}}>
                <Star className="text-muted h-4 w-4" />
                Add to favorites
              </DropdownItem>
              <DropdownItem onClick={() => {}} disabled>
                <Download className="h-4 w-4" />
                Download (unavailable)
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Accessibility Notes */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Accessibility
        </h3>
        <div className="bg-surface-alt rounded-card space-y-2 p-4">
          <div className="flex items-start gap-3">
            <span className="text-valley-green text-lg">✓</span>
            <p className="text-body text-sm">
              <strong>Keyboard navigation</strong> - Arrow keys to navigate,
              Enter to select, Escape to close
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-valley-green text-lg">✓</span>
            <p className="text-body text-sm">
              <strong>Focus management</strong> - Focus trapped within open
              overlays, returns to trigger on close
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-valley-green text-lg">✓</span>
            <p className="text-body text-sm">
              <strong>Screen reader support</strong> - Proper ARIA roles and
              labels via HeadlessUI
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-valley-green text-lg">✓</span>
            <p className="text-body text-sm">
              <strong>Click outside to close</strong> - Standard dismissal
              behavior for all overlays
            </p>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="border-hairline bg-surface rounded-card border p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">Usage</h3>
        <div className="space-y-2">
          <code className="text-muted block text-sm">
            {`import { Tooltip } from "@/components/ui/tooltip";`}
          </code>
          <code className="text-muted block text-sm">
            {`import { Dropdown, DropdownButton, DropdownMenu, DropdownItem } from "@/components/catalyst-ui/dropdown";`}
          </code>
          <div className="border-hairline my-2 border-t" />
          <code className="text-muted block text-sm">{`// Tooltip`}</code>
          <code className="text-muted block text-sm">
            {`<Tooltip content="Helpful text" position="top">`}
          </code>
          <code className="text-muted block pl-4 text-sm">
            {`<button>Hover me</button>`}
          </code>
          <code className="text-muted block text-sm">{`</Tooltip>`}</code>
          <div className="border-hairline my-2 border-t" />
          <code className="text-muted block text-sm">{`// Dropdown`}</code>
          <code className="text-muted block text-sm">{`<Dropdown>`}</code>
          <code className="text-muted block pl-4 text-sm">
            {`<DropdownButton>Menu</DropdownButton>`}
          </code>
          <code className="text-muted block pl-4 text-sm">{`<DropdownMenu>`}</code>
          <code className="text-muted block pl-8 text-sm">
            {`<DropdownItem onClick={...}>Action</DropdownItem>`}
          </code>
          <code className="text-muted block pl-4 text-sm">{`</DropdownMenu>`}</code>
          <code className="text-muted block text-sm">{`</Dropdown>`}</code>
        </div>
      </div>
    </div>
  );
}
