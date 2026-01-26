"use client";

import {
  Avatar,
  AvatarButton,
  AvatarGroup,
} from "@/components/ui/avatar";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

const SIZE_DESCRIPTIONS: Record<(typeof SIZES)[number], string> = {
  xs: "24px - Compact inline contexts",
  sm: "32px - Comment threads, lists",
  md: "40px - Default, cards, nav",
  lg: "48px - Profile highlights",
  xl: "64px - Profile header, hero",
};

const SAMPLE_USERS = [
  { name: "Maria Silva", src: "/images/avatars/avatar-1.jpg" },
  { name: "João Santos", src: "/images/avatars/avatar-2.jpg" },
  { name: "Ana Costa", src: "/images/avatars/avatar-3.jpg" },
  { name: "Carlos Lima", src: "/images/avatars/avatar-4.jpg" },
  { name: "Sofia Nunes", src: "/images/avatars/avatar-5.jpg" },
  { name: "Pedro Alves", src: "/images/avatars/avatar-6.jpg" },
];

/**
 * Avatar specimen for the design system gallery.
 * Showcases Avatar, AvatarGroup, and AvatarButton custom components.
 */
export function AvatarSpecimen() {
  return (
    <div className="space-y-10">
      {/* Size Variants */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Size Variants
        </h3>
        <div className="space-y-4">
          {SIZES.map((size) => (
            <div key={size} className="flex items-center gap-4">
              <Avatar initials="AB" size={size} className="shrink-0" />
              <div>
                <span className="text-body text-sm font-medium">{size}</span>
                <span className="text-muted ml-2 text-sm">
                  - {SIZE_DESCRIPTIONS[size]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Initials Fallback */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Initials Fallback
        </h3>
        <p className="text-muted mb-4 text-sm">
          When no image is provided, displays up to 2 characters as initials.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar initials="MS" size="lg" />
          <Avatar initials="JC" size="lg" />
          <Avatar initials="A" size="lg" />
          <Avatar size="lg" />
        </div>
        <p className="text-muted mt-2 text-xs">
          Left to right: Two initials, single character, no initials (default
          icon)
        </p>
      </div>

      {/* Status Indicators */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Status Indicators
        </h3>
        <p className="text-muted mb-4 text-sm">
          Optional status dot positioned at bottom-right.
        </p>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Avatar initials="ON" size="lg" status="online" />
            <span className="text-muted text-xs">online</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar initials="OF" size="lg" status="offline" />
            <span className="text-muted text-xs">offline</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar initials="AW" size="lg" status="away" />
            <span className="text-muted text-xs">away</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar initials="BY" size="lg" status="busy" />
            <span className="text-muted text-xs">busy</span>
          </div>
        </div>
      </div>

      {/* Square Variant */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Square Variant
        </h3>
        <p className="text-muted mb-4 text-sm">
          Use square={"{true}"} for team/organization avatars.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar initials="NI" size="md" square />
          <Avatar initials="CV" size="md" square status="online" />
          <Avatar initials="BR" size="lg" square />
        </div>
      </div>

      {/* Avatar Group */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Avatar Group
        </h3>
        <p className="text-muted mb-4 text-sm">
          Stacked display with configurable max and overflow indicator.
        </p>
        <div className="space-y-6">
          <div>
            <p className="text-muted mb-2 text-xs">Default (max 4):</p>
            <AvatarGroup>
              {SAMPLE_USERS.map((user, i) => (
                <Avatar key={i} initials={user.name.slice(0, 2)} />
              ))}
            </AvatarGroup>
          </div>
          <div>
            <p className="text-muted mb-2 text-xs">max={"{3}"} size="sm":</p>
            <AvatarGroup max={3} size="sm">
              {SAMPLE_USERS.map((user, i) => (
                <Avatar key={i} initials={user.name.slice(0, 2)} />
              ))}
            </AvatarGroup>
          </div>
          <div>
            <p className="text-muted mb-2 text-xs">max={"{5}"} size="lg":</p>
            <AvatarGroup max={5} size="lg">
              {SAMPLE_USERS.map((user, i) => (
                <Avatar key={i} initials={user.name.slice(0, 2)} />
              ))}
            </AvatarGroup>
          </div>
        </div>
      </div>

      {/* Interactive Avatar */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Interactive AvatarButton
        </h3>
        <p className="text-muted mb-4 text-sm">
          Clickable avatar with expanded touch target and focus ring.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <AvatarButton
            initials="MS"
            size="lg"
            status="online"
            onClick={() => {}}
          />
          <AvatarButton initials="JC" size="lg" onClick={() => {}} />
          <AvatarButton size="lg" onClick={() => {}} />
        </div>
      </div>

      {/* In Context */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          In Context
        </h3>
        <div className="border-hairline bg-surface rounded-card border p-4">
          <h4 className="text-body mb-4 text-sm font-medium">Contributors</h4>
          <div className="space-y-3">
            {SAMPLE_USERS.slice(0, 3).map((user, i) => (
              <div key={i} className="flex items-center gap-3">
                <Avatar initials={user.name.slice(0, 2)} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-body text-sm font-medium">{user.name}</p>
                  <p className="text-muted text-xs">Community contributor</p>
                </div>
                <span className="text-muted text-xs">2 stories</span>
              </div>
            ))}
          </div>
          <div className="border-hairline mt-4 flex items-center gap-2 border-t pt-4">
            <AvatarGroup max={4} size="xs">
              {SAMPLE_USERS.map((user, i) => (
                <Avatar key={i} initials={user.name.slice(0, 2)} />
              ))}
            </AvatarGroup>
            <span className="text-muted text-xs">6 contributors</span>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="border-hairline bg-surface rounded-card border p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">Usage</h3>
        <div className="space-y-2">
          <code className="text-muted block text-sm">
            {`import { Avatar, AvatarGroup, AvatarButton } from "@/components/ui/avatar";`}
          </code>
          <div className="border-hairline my-2 border-t" />
          <code className="text-muted block text-sm">{`// Basic avatar with initials`}</code>
          <code className="text-muted block text-sm">
            {`<Avatar initials="MS" size="md" />`}
          </code>
          <div className="border-hairline my-2 border-t" />
          <code className="text-muted block text-sm">{`// With status indicator`}</code>
          <code className="text-muted block text-sm">
            {`<Avatar initials="MS" status="online" />`}
          </code>
          <div className="border-hairline my-2 border-t" />
          <code className="text-muted block text-sm">{`// Avatar group`}</code>
          <code className="text-muted block text-sm">
            {`<AvatarGroup max={4}>`}
          </code>
          <code className="text-muted block pl-4 text-sm">
            {`<Avatar initials="AB" />`}
          </code>
          <code className="text-muted block pl-4 text-sm">
            {`<Avatar initials="CD" />`}
          </code>
          <code className="text-muted block text-sm">{`</AvatarGroup>`}</code>
        </div>
      </div>
    </div>
  );
}
