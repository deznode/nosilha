"use client";

import { Card } from "@/components/ui/card";
import { MapPin, Star, Calendar, User } from "lucide-react";

/**
 * Card specimen for the design system gallery.
 * Showcases Card component variants and patterns.
 */
export function CardSpecimen() {
  return (
    <div className="space-y-10">
      {/* Basic Cards */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Basic Card
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h4 className="text-body font-semibold">Default Card</h4>
            <p className="text-muted mt-2 text-sm">
              This is a basic card with subtle shadow and rounded corners. Uses
              the Calm Premium design tokens.
            </p>
          </Card>
          <Card hoverable className="p-6">
            <h4 className="text-body font-semibold">Hoverable Card</h4>
            <p className="text-muted mt-2 text-sm">
              Hover over this card to see the lift animation with shadow
              transition. Great for interactive elements.
            </p>
          </Card>
        </div>
      </div>

      {/* Card with Content Patterns */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Content Patterns
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Stats Card */}
          <Card className="p-6">
            <div className="text-muted text-sm">Total Entries</div>
            <div className="text-body mt-1 text-3xl font-bold">1,234</div>
            <div className="text-valley-green mt-2 text-sm">
              +12% from last month
            </div>
          </Card>

          {/* Profile Card */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-ocean-blue/10 flex h-12 w-12 items-center justify-center rounded-full">
                <User className="text-ocean-blue h-6 w-6" />
              </div>
              <div>
                <h4 className="text-body font-semibold">João Costa</h4>
                <p className="text-muted text-sm">Contributor</p>
              </div>
            </div>
          </Card>

          {/* Event Card */}
          <Card hoverable className="p-6">
            <div className="text-muted flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>December 15, 2024</span>
            </div>
            <h4 className="text-body mt-2 font-semibold">Festival da Música</h4>
            <p className="text-muted mt-1 text-sm">
              Traditional music celebration
            </p>
          </Card>
        </div>
      </div>

      {/* Directory Card Pattern */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Directory Card Pattern
        </h3>
        <div className="max-w-sm">
          <Card hoverable className="overflow-hidden">
            {/* Image Placeholder */}
            <div className="bg-surface-alt relative h-48 w-full">
              <div className="flex h-full items-center justify-center">
                <span className="text-muted text-sm">Image Area</span>
              </div>
              {/* Category Badge */}
              <div className="absolute top-2 left-2">
                <span className="bg-basalt-900/80 rounded px-2 py-1 text-xs text-white backdrop-blur-sm">
                  Heritage
                </span>
              </div>
            </div>
            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-body text-lg font-semibold">
                  Igreja de São João Baptista
                </h4>
                <div className="border-hairline bg-surface flex items-center rounded border px-1.5 py-0.5 text-xs">
                  <Star className="text-sunny-yellow mr-1 h-3 w-3 fill-current" />
                  4.8
                </div>
              </div>
              <div className="text-muted mt-1 flex items-center text-sm">
                <MapPin className="mr-1 h-4 w-4" />
                <span>Vila Nova Sintra</span>
              </div>
              <p className="text-muted mt-2 line-clamp-2 text-sm">
                Historic church dating back to the 18th century, featuring
                beautiful baroque architecture.
              </p>
              <div className="mt-3 flex gap-1.5">
                <span className="bg-surface-alt text-muted rounded-full px-2 py-0.5 text-xs">
                  #historic
                </span>
                <span className="bg-surface-alt text-muted rounded-full px-2 py-0.5 text-xs">
                  #church
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Card Design Tokens */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Design Tokens Used
        </h3>
        <div className="border-hairline bg-surface rounded-card grid gap-4 border p-4 sm:grid-cols-2">
          <div>
            <code className="text-ocean-blue text-sm">rounded-card</code>
            <p className="text-muted mt-1 text-xs">16px border radius</p>
          </div>
          <div>
            <code className="text-ocean-blue text-sm">shadow-subtle</code>
            <p className="text-muted mt-1 text-xs">Default card shadow</p>
          </div>
          <div>
            <code className="text-ocean-blue text-sm">shadow-lift</code>
            <p className="text-muted mt-1 text-xs">Hover state shadow</p>
          </div>
          <div>
            <code className="text-ocean-blue text-sm">border-hairline</code>
            <p className="text-muted mt-1 text-xs">Subtle border color</p>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="border-hairline bg-surface rounded-card border p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">Import</h3>
        <code className="text-muted text-sm">
          {`import { Card } from "@/components/ui/card"`}
        </code>
      </div>
    </div>
  );
}
