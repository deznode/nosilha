"use client";

import { Badge, BadgeButton } from "@/components/catalyst-ui/badge";

const BADGE_COLORS = ["blue", "green", "yellow", "red", "zinc"] as const;

const COLOR_DESCRIPTIONS: Record<(typeof BADGE_COLORS)[number], string> = {
  blue: "Primary / Ocean Blue - default for brand actions",
  green: "Success - confirmations, positive states",
  yellow: "Warning / Sobrado Ochre - caution, attention needed",
  red: "Destructive - errors, critical states",
  zinc: "Neutral - default, metadata, secondary info",
};

/**
 * Badge specimen for the design system gallery.
 * Showcases Badge and BadgeButton from Catalyst UI with 5 color variants.
 */
export function BadgeSpecimen() {
  return (
    <div className="space-y-10">
      {/* Color Variants */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Color Variants
        </h3>
        <div className="space-y-4">
          {BADGE_COLORS.map((color) => (
            <div key={color} className="flex items-center gap-4">
              <Badge color={color} className="min-w-[80px] justify-center">
                {color}
              </Badge>
              <span className="text-muted text-sm">
                {COLOR_DESCRIPTIONS[color]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Common Use Cases */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Common Use Cases
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Badge color="blue">New</Badge>
          <Badge color="green">Published</Badge>
          <Badge color="yellow">Draft</Badge>
          <Badge color="red">Archived</Badge>
          <Badge color="zinc">12 items</Badge>
        </div>
      </div>

      {/* Category Badges */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Category Badges (Directory Example)
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Badge color="blue">Restaurant</Badge>
          <Badge color="green">Nature</Badge>
          <Badge color="yellow">Heritage</Badge>
          <Badge color="zinc">Beach</Badge>
          <Badge color="zinc">Hotel</Badge>
        </div>
      </div>

      {/* BadgeButton - Interactive */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Interactive BadgeButton
        </h3>
        <p className="text-muted mb-4 text-sm">
          BadgeButton wraps Badge with button or link behavior. Includes focus
          ring and hover state.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <BadgeButton color="blue" onClick={() => {}}>
            Clickable Badge
          </BadgeButton>
          <BadgeButton color="green" href="/directory">
            Link Badge
          </BadgeButton>
          <BadgeButton color="zinc" onClick={() => {}}>
            Filter: All
          </BadgeButton>
        </div>
      </div>

      {/* In Context */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          In Context
        </h3>
        <div className="border-hairline bg-surface rounded-card flex items-start gap-4 border p-4">
          <div className="bg-surface-alt h-16 w-16 flex-shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-body font-medium">
                Restaurante Morabeza
              </span>
              <Badge color="blue">Restaurant</Badge>
            </div>
            <p className="text-muted text-sm">
              Traditional Cape Verdean cuisine in Nova Sintra
            </p>
            <div className="mt-2 flex gap-2">
              <Badge color="green">Open Now</Badge>
              <Badge color="zinc">4.5 stars</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="border-hairline bg-surface rounded-card border p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">Usage</h3>
        <div className="space-y-2">
          <code className="text-muted block text-sm">
            {`import { Badge, BadgeButton } from "@/components/catalyst-ui/badge";`}
          </code>
          <div className="border-hairline my-2 border-t" />
          <code className="text-muted block text-sm">{`// Static badge`}</code>
          <code className="text-muted block text-sm">
            {`<Badge color="blue">New</Badge>`}
          </code>
          <code className="text-muted block text-sm">
            {`<Badge color="green">Published</Badge>`}
          </code>
          <div className="border-hairline my-2 border-t" />
          <code className="text-muted block text-sm">
            {`// Interactive badge (button)`}
          </code>
          <code className="text-muted block text-sm">
            {`<BadgeButton color="blue" onClick={handleClick}>Click me</BadgeButton>`}
          </code>
          <div className="border-hairline my-2 border-t" />
          <code className="text-muted block text-sm">
            {`// Interactive badge (link)`}
          </code>
          <code className="text-muted block text-sm">
            {`<BadgeButton color="green" href="/path">View all</BadgeButton>`}
          </code>
        </div>
      </div>
    </div>
  );
}
