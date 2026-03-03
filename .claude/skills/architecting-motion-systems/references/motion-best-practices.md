# Motion.dev Best Practices

Motion.dev (formerly Framer Motion) provides native reduced motion support and modern patterns for React/Next.js applications.

## MotionConfig Provider

Use `MotionConfig` in root layout to automatically handle reduced motion:

```tsx
import { MotionConfig } from "framer-motion";

// In root layout - automatically handles reduced motion
<MotionConfig reducedMotion="user">
  {children}
</MotionConfig>
```

### reducedMotion Options

| Value | Behavior |
|-------|----------|
| `"user"` | Respects OS setting automatically (recommended) |
| `"always"` | Force reduced motion for all users |
| `"never"` | Ignore OS setting (not recommended) |

## useReducedMotion Hook

The native `useReducedMotion` hook from framer-motion is available for component-level checks:

```tsx
import { useReducedMotion } from "framer-motion";

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ y: shouldReduceMotion ? 0 : 20, opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
    >
      Content
    </motion.div>
  );
}
```

## Performance Guidelines

1. Prefer transform properties: `x`, `y`, `scale`, `rotate` (GPU-accelerated)
2. Avoid layout-triggering properties: `width`, `height`, `top`, `left`
3. Use `layoutId` sparingly for true shared element transitions
4. Set `viewport.once: true` for scroll-triggered animations
5. Lazy-load heavy animations with `next/dynamic`

## Server/Client Component Integration

- Motion components require `"use client"` directive
- Keep animation logic in client components
- Pass data from server components to animated client wrappers

## References

- [Motion.dev Documentation](https://motion.dev)
- [Reduced Motion Guide](https://motion.dev/guides/accessibility)
- `docs/ANIMATION_SYSTEM.md` - Project implementation guide
