"use client";

import { ArrowRight, Heart, Send } from "lucide-react";
import { AnimatedButton } from "@/components/ui/animated-button";

/**
 * Button specimen for the design system gallery.
 * Showcases AnimatedButton variants, sizes, states, and icon positions.
 */
export function ButtonSpecimen() {
  return (
    <div className="space-y-10">
      {/* Variants */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Variants
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <AnimatedButton variant="primary">Primary</AnimatedButton>
          <AnimatedButton variant="secondary">Secondary</AnimatedButton>
          <AnimatedButton variant="outline">Outline</AnimatedButton>
          <AnimatedButton variant="ghost">Ghost</AnimatedButton>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Sizes
        </h3>
        <div className="flex flex-wrap items-end gap-4">
          <AnimatedButton size="sm">Small</AnimatedButton>
          <AnimatedButton size="md">Medium</AnimatedButton>
          <AnimatedButton size="lg">Large</AnimatedButton>
        </div>
      </div>

      {/* With Icons */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          With Icons
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <AnimatedButton icon={<Heart className="h-4 w-4" />}>
            Left Icon
          </AnimatedButton>
          <AnimatedButton
            icon={<ArrowRight className="h-4 w-4" />}
            iconPosition="right"
          >
            Right Icon
          </AnimatedButton>
          <AnimatedButton
            variant="secondary"
            icon={<Send className="h-4 w-4" />}
          >
            Send Message
          </AnimatedButton>
        </div>
      </div>

      {/* States */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          States
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <AnimatedButton>Default</AnimatedButton>
          <AnimatedButton isLoading>Loading</AnimatedButton>
          <AnimatedButton disabled>Disabled</AnimatedButton>
          <AnimatedButton variant="outline" isLoading>
            Loading Outline
          </AnimatedButton>
        </div>
      </div>

      {/* Full Width */}
      <div>
        <h3 className="text-body mb-4 text-sm font-semibold tracking-wide uppercase">
          Full Width
        </h3>
        <AnimatedButton className="w-full">Full Width Button</AnimatedButton>
      </div>

      {/* Code Example */}
      <div className="border-hairline bg-surface rounded-card border p-4">
        <h3 className="text-body mb-2 text-sm font-semibold">Import</h3>
        <code className="text-muted text-sm">
          {`import { AnimatedButton } from "@/components/ui/animated-button"`}
        </code>
      </div>
    </div>
  );
}
