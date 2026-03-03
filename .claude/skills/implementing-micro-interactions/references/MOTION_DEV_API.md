# Motion.dev Best Practices

Motion.dev (formerly Framer Motion) provides native reduced motion support and configuration patterns.

## MotionConfig Provider

Use `MotionConfig` in your root layout to automatically handle reduced motion:

```tsx
import { MotionConfig } from "framer-motion"

// In root layout - automatically handles reduced motion
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MotionConfig reducedMotion="user">
          {children}
        </MotionConfig>
      </body>
    </html>
  )
}
```

### reducedMotion Options

| Value | Behavior |
|-------|----------|
| `"user"` | Respect system preference (recommended) |
| `"always"` | Always reduce motion |
| `"never"` | Never reduce motion (not recommended) |

## useReducedMotion Hook

Motion.dev provides a native hook for checking reduced motion preference:

```tsx
import { useReducedMotion } from "framer-motion"

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      animate={{
        y: shouldReduceMotion ? 0 : 20,
        opacity: 1
      }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.3
      }}
    >
      Content
    </motion.div>
  )
}
```

## Integration with lib/animation

The `MotionConfig` provider can be used alongside the custom `MotionConfigProvider` from `lib/animation`. The native provider handles system preferences, while the custom provider can add project-specific configuration.

```tsx
// Option 1: Native MotionConfig only
<MotionConfig reducedMotion="user">
  {children}
</MotionConfig>

// Option 2: Combined approach
<MotionConfig reducedMotion="user">
  <MotionConfigProvider>
    {children}
  </MotionConfigProvider>
</MotionConfig>
```

## Animation Variants Pattern

Use variants with `motion` for reusable animations:

```tsx
import { motion, Variants } from "framer-motion"

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  }
}

function FadeInSection({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeInUp}
    >
      {children}
    </motion.div>
  )
}
```

## Layout Animations

For smooth layout changes, use `layout` prop or `LayoutGroup`:

```tsx
import { motion, LayoutGroup } from "framer-motion"

// Single element layout animation
<motion.div layout>
  {isExpanded ? <ExpandedContent /> : <CollapsedContent />}
</motion.div>

// Grouped layout animations
<LayoutGroup>
  <motion.div layoutId="shared-element">
    {/* Content shared across routes/states */}
  </motion.div>
</LayoutGroup>
```

## Performance Tips

1. **Prefer transform properties**: `x`, `y`, `scale`, `rotate` (GPU-accelerated)
2. **Avoid layout-triggering properties**: `width`, `height`, `top`, `left`
3. **Use `layoutId` sparingly**: Only for true shared element transitions
4. **Set `viewport.once: true`**: For scroll-triggered animations
5. **Lazy-load heavy animations**: Use `next/dynamic` for animation-heavy components

## References

- [Motion.dev Documentation](https://motion.dev)
- [Reduced Motion Guide](https://motion.dev/guides/accessibility)
- [Layout Animations](https://motion.dev/docs/layout-animations)
