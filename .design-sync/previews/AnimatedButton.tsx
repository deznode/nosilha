import { AnimatedButton } from "frontend";
import { ArrowRight, Heart, Send } from "lucide-react";

/*
 * Ported from the repo's own specimen gallery:
 * apps/web/src/app/(main)/design-system/_components/specimens/button-specimen.tsx
 */

/** The four variants, in the order the specimen gallery presents them. */
export function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <AnimatedButton variant="primary">Explore the directory</AnimatedButton>
      <AnimatedButton variant="secondary">Browse the gallery</AnimatedButton>
      <AnimatedButton variant="outline">View on the map</AnimatedButton>
      <AnimatedButton variant="ghost">Cancel</AnimatedButton>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <AnimatedButton size="sm">Small</AnimatedButton>
      <AnimatedButton size="md">Medium</AnimatedButton>
      <AnimatedButton size="lg">Large</AnimatedButton>
    </div>
  );
}

export function WithIcons() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <AnimatedButton icon={<Heart className="h-4 w-4" />}>
        Save this place
      </AnimatedButton>
      <AnimatedButton
        icon={<ArrowRight className="h-4 w-4" />}
        iconPosition="right"
      >
        Read the story
      </AnimatedButton>
      <AnimatedButton variant="secondary" icon={<Send className="h-4 w-4" />}>
        Send a correction
      </AnimatedButton>
    </div>
  );
}

/** Statically renderable states. Hover and tap are motion-driven and skipped. */
export function States() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <AnimatedButton>Default</AnimatedButton>
      <AnimatedButton isLoading>Submitting</AnimatedButton>
      <AnimatedButton disabled>Unavailable</AnimatedButton>
      <AnimatedButton variant="outline" isLoading>
        Loading
      </AnimatedButton>
    </div>
  );
}
