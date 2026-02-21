---
paths: apps/web/**
---

# Component Patterns

## forwardRef Components

```tsx
import * as React from "react";
import { clsx } from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        "rounded-card border-hairline bg-surface shadow-subtle border",
        hoverable && "hover:shadow-lift transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";
```

Always: set `displayName`, spread `{...props}`, accept `className` prop.

## Conditional Classes

Use `clsx()` — never template literals for conditional classes:

```tsx
import { clsx } from "clsx";

// GOOD
className={clsx(
  "rounded-card border",
  isActive && "ring-2 ring-primary",
  disabled && "opacity-50 cursor-not-allowed",
  className
)}

// GOOD — with size mapping
const sizeClasses = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
className={clsx("relative", sizeClasses[size])}

// BAD — template literals
className={`rounded-card border ${isActive ? "ring-2 ring-primary" : ""}`}
```

## Toast Notifications

Fluent API via `useToast()`:

```tsx
const toast = useToast();

toast.success("Profile updated").show();
toast.error("Failed to save").show();
toast.info("Processing...").duration(8000).show();
toast.success("Added to favorites").action("Undo", handleUndo).show();
toast.warning("Session expiring").id("session-warning").show();
toast.clearAll();
```

Default durations: success/info 4s, warning 6s, error 10s.

## Loading & Empty States

```tsx
// Spinner
import { LoadingSpinner } from "@/components/ui/loading-spinner";

<LoadingSpinner size="md" text="Loading directory..." />

// Skeleton grid
import { DirectoryGridSkeleton } from "@/components/ui/directory-grid-skeleton";

{isLoading ? <DirectoryGridSkeleton /> : <DirectoryGrid entries={entries} />}

// Empty state
{entries.length === 0 && !isLoading && (
  <div className="flex flex-col items-center justify-center py-12">
    <span className="text-muted">No entries found</span>
  </div>
)}
```

## Import Organization

```tsx
// 1. React / Next.js
import type { Metadata } from "next";
import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// 2. External libraries
import { motion } from "framer-motion";
import clsx from "clsx";
import { ChevronDown, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// 3. Internal — components, utils, types (@ alias)
import { Card } from "@/components/ui/card";
import { getEntriesByCategory } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import type { DirectoryEntry } from "@/types/directory";
```

## Image Handling

Use Next.js `<Image>` with `fill` + responsive `sizes`:

```tsx
import Image from "next/image";

// Card image
<div className="relative h-48 w-full overflow-hidden">
  {entry.imageUrl ? (
    <Image
      src={entry.imageUrl}
      alt={`Photo of ${entry.name}`}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover"
    />
  ) : (
    <div className="bg-surface-alt flex h-full items-center justify-center">
      <span className="text-muted">No image available</span>
    </div>
  )}
</div>

// Hero image (above fold)
<Image src={src} alt={alt} fill priority sizes="100vw" className="object-cover" />
```

## Auth Guards

```tsx
const isAuthenticated = useIsAuthenticated();
const session = useSession();

const handleAction = async () => {
  if (!isAuthenticated || !session?.access_token) {
    toast.error("Please sign in").duration(5000).show();
    return;
  }
  // Proceed with authenticated action
};
```

## Reference

- UI components: `apps/web/src/components/ui/`
- Catalyst UI: `apps/web/src/components/catalyst-ui/`
- See `docs/10-product/design-system.md` for design system guide
