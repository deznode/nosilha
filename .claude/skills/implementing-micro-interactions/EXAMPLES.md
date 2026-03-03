# Implementing Micro-Interactions – Usage Examples

This file shows concrete input → output examples of how this Skill should behave in Claude Code.

---

## Example 1 – Add micro-interaction to a primary button

**Input (user):**  
"Add a subtle hover and tap animation to this primary button using our motion system."

```tsx
// Before
<button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
  Save changes
</button>
```

**Expected Output (Claude using this Skill):**

```tsx
import { AnimatedButton } from "@/lib/animation/components/AnimatedButton";

<AnimatedButton variant="primary">
  Save changes
</AnimatedButton>
```

---

## Example 2 – Replace ad-hoc variants with shared tokens

**Input:**
"We currently use hardcoded durations for this card animation. Refactor to use motion tokens."

```tsx
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35 },
  },
};
```

**Expected Output:**

```tsx
import { motionDuration, motionEasing, motionDistance } from "@/lib/animation";

const cardVariants = {
  hidden: { opacity: 0, y: motionDistance.medium },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionDuration.normal,
      ease: motionEasing.out,
    },
  },
} as const;
```

---

## Example 3 – Introduce \`FadeInSection\` to a marketing block

**Input:**
"Animate this marketing section so it fades up when scrolled into view."

```tsx
<section className="py-16">
  <h2 className="text-3xl font-bold">Why teams love our product</h2>
  <p className="mt-4 text-slate-500">…</p>
</section>
```

**Expected Output:**

```tsx
import { FadeInSection } from "@/lib/animation/components/FadeInSection";

<FadeInSection className="py-16">
  <h2 className="text-3xl font-bold">Why teams love our product</h2>
  <p className="mt-4 text-slate-500">…</p>
</FadeInSection>
```

---

## Example 4 – Implement route transitions in App Router

**Input:**
"Add a subtle page transition for all routes in the App Router."

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**Expected Output:**

```tsx
// app/layout.tsx
import { PageTransitionProvider } from "@/lib/animation/components/PageTransitionProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PageTransitionProvider>{children}</PageTransitionProvider>
      </body>
    </html>
  );
}
```

---

## Example 5 – Use \`HoverCard\` for dashboard tiles

**Input:**
"Give these dashboard cards a hover elevation effect with our shared HoverCard."

```tsx
<div className="grid gap-4 md:grid-cols-3">
  {cards.map(card => (
    <div key={card.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h3>{card.title}</h3>
    </div>
  ))}
</div>
```

**Expected Output:**

```tsx
import { HoverCard } from "@/lib/animation/components/HoverCard";

<div className="grid gap-4 md:grid-cols-3">
  {cards.map(card => (
    <HoverCard key={card.id}>
      <h3>{card.title}</h3>
    </HoverCard>
  ))}
</div>
```

---

## Example 6 – Respect reduced motion in a component

**Input:**
"Update this animated panel to respect reduced-motion using MotionConfig."

```tsx
const variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};
```

**Expected Output:**

```tsx
import { useMotionConfig } from "@/lib/animation";

const variants = (reducedMotion: boolean) => ({
  hidden: { opacity: 0, y: reducedMotion ? 0 : 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: reducedMotion ? 0 : 0.24,
    },
  },
});

export function AnimatedPanel({ children }: { children: React.ReactNode }) {
  const { reducedMotion } = useMotionConfig();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants(reducedMotion)}
    >
      {children}
    </motion.div>
  );
}
```

---

## Example 7 – Convert inline motion button to \`AnimatedButton\`

**Input:**
"Refactor this inline motion button to use the shared AnimatedButton component."

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white"
>
  Create project
</motion.button>
```

**Expected Output:**

```tsx
import { AnimatedButton } from "@/lib/animation/components/AnimatedButton";

<AnimatedButton variant="primary">
  Create project
</AnimatedButton>
```

---

## Example 8 – Use list stagger variants

**Input:**
"Animate this list with a staggered fade-in using our listStagger and listItem variants."

```tsx
<ul>
  {items.map(item => (
    <li key={item.id}>{item.label}</li>
  ))}
</ul>
```

**Expected Output:**

```tsx
import { motion } from "framer-motion";
import { listStagger, listItem } from "@/lib/animation";

<motion.ul variants={listStagger} initial="hidden" animate="show">
  {items.map(item => (
    <motion.li key={item.id} variants={listItem}>
      {item.label}
    </motion.li>
  ))}
</motion.ul>
```

---

## Example 9 – Add shared-element transition for tabs

**Input:**
"Use a shared underline for tabs using layoutId, according to our motion system."

```tsx
const tabs = ["Overview", "Settings", "Billing"];
```

**Expected Output (pattern):**

```tsx
import { motion } from "framer-motion";

const tabs = ["Overview", "Settings", "Billing"];

export function Tabs({ active }: { active: string }) {
  return (
    <div className="flex gap-4 border-b border-slate-800">
      {tabs.map(tab => {
        const isActive = tab === active;
        return (
          <button key={tab} className="relative pb-2 text-sm font-medium">
            <span className={isActive ? "text-white" : "text-slate-400"}>{tab}</span>
            {isActive && (
              <motion.div
                layoutId="tab-underline"
                className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-indigo-500"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
```

---

## Example 10 – Animate modal entry and exit

**Input:**
"Animate this modal using our motion tokens and factories."

```tsx
// Existing modal without animation
<div className="fixed inset-0 flex items-center justify-center bg-black/40">
  <div className="rounded-xl bg-slate-900 p-6">Modal content</div>
</div>
```

**Expected Output (pattern):**

```tsx
import { motion, AnimatePresence } from "framer-motion";
import { makeScaleIn } from "@/lib/animation";

const modalVariants = makeScaleIn();

export function Modal({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="rounded-xl bg-slate-900 p-6"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## Example 11 – Scroll-triggered fade-in section

**Input:**
"Animate this section when it comes into view using whileInView and our tokens."

```tsx
<section className="py-24">
  <h2>Features</h2>
</section>
```

**Expected Output:**

```tsx
import { motion } from "framer-motion";
import { motionDuration, motionEasing, motionDistance } from "@/lib/animation";

const fadeInUp = {
  hidden: { opacity: 0, y: motionDistance.small },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionDuration.normal,
      ease: motionEasing.out,
    },
  },
} as const;

<motion.section
  className="py-24"
  variants={fadeInUp}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.3 }}
>
  <h2>Features</h2>
</motion.section>
```

---

## Example 12 – Implement drag with constraints

**Input:**
"Make this chip draggable along the x-axis with a subtle rubber-band effect."

```tsx
<div className="inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-100">
  Drag me
</div>
```

**Expected Output:**

```tsx
import { motion } from "framer-motion";
import { motionDuration } from "@/lib/animation";

<motion.div
  className="inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-100"
  drag="x"
  dragConstraints={{ left: -40, right: 40 }}
  dragElastic={0.3}
  transition={{ duration: motionDuration.fast }}
>
  Drag me
</motion.div>
```

---

## Example 13 – Convert CSS hover transitions to motion

**Input:**
"This card uses Tailwind \`transition\` classes. Replace with Framer Motion hover using our tokens, but keep Tailwind for color."

```tsx
<div className="rounded-lg border border-slate-800 bg-slate-900 p-4 transition-transform duration-200 hover:-translate-y-1">
  <h3>Plan</h3>
</div>
```

**Expected Output:**

```tsx
import { HoverCard } from "@/lib/animation/components/HoverCard";

<HoverCard>
  <h3>Plan</h3>
</HoverCard>
```

---

## Example 14 – Introduce MotionConfigProvider

**Input:**
"We don't have motion config wired. Add it using MotionConfigProvider."

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**Expected Output:**

```tsx
// app/layout.tsx
import { MotionConfigProvider } from "@/lib/animation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MotionConfigProvider>{children}</MotionConfigProvider>
      </body>
    </html>
  );
}
```

---

## Example 15 – Implement animation-aware error toast

**Input:**
"Wrap this error toast in an animated toast pattern using our tokens/variants."

```tsx
<div className="fixed bottom-4 right-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white">
  Something went wrong
</div>
```

**Expected Output (pattern):**

```tsx
import { motion, AnimatePresence } from "framer-motion";
import { motionDuration, motionEasing, motionDistance } from "@/lib/animation";

const toastVariants = {
  hidden: { opacity: 0, y: motionDistance.small, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: motionDuration.fast,
      ease: motionEasing.out,
    },
  },
  exit: {
    opacity: 0,
    y: motionDistance.small,
    scale: 0.96,
    transition: {
      duration: motionDuration.fast,
      ease: motionEasing.in,
    },
  },
} as const;

export function ErrorToast({ message, open }: { message: string; open: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed bottom-4 right-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---
