# Development Constitution

Core principles governing all development decisions for Nos Ilha.

## Application Type: Consumer Application

This is a **consumer-facing cultural heritage hub** where user experience and visual appeal are paramount.

### Consumer Application Priorities

1. **Visual Appeal First** - Every interaction should feel crafted and intentional
2. **Microinteractions Matter** - Subtle animations provide feedback and delight
3. **Progressive Disclosure** - Reveal complexity gradually, never overwhelm
4. **Emotional Connection** - Design for cultural pride and community belonging
5. **Accessibility Always** - WCAG 2.1 AA compliance, inclusive by default

## Technical Stack Principles

### React 19 + TypeScript

- **Server Components by default** - Use `'use client'` only when necessary
- **Strict TypeScript** - No `any` types, explicit interfaces for all props
- **Composition over inheritance** - Small, focused components
- **Colocation** - Keep related code together (component, styles, tests, types)

### Tailwind CSS v4

- **Design tokens first** - Use CSS variables for theming
- **Utility classes preferred** - Extract components only for repeated patterns
- **Responsive mobile-first** - Start with mobile, add breakpoint modifiers
- **Dark mode support** - Use `dark:` variants consistently

### Next.js 16 App Router

- **File-based routing** - Leverage route groups for organization
- **Streaming and Suspense** - Progressive loading for better UX
- **ISR for content** - Incremental Static Regeneration for dynamic freshness
- **Edge-ready** - Design for serverless deployment

## Design System Integration

### Catalyst UI Foundation

- Extend Catalyst components rather than replacing them
- Maintain consistent spacing scale (4px base unit)
- Follow established color palette with semantic naming
- Respect component API conventions

### Cultural Heritage Considerations

- **Typography** - Support Portuguese diacritics and special characters
- **Imagery** - Handle historical photos with care and context
- **Content** - Preserve authenticity while ensuring accessibility
- **Localization** - Design for future multilingual support

## Code Quality Standards

### Component Guidelines

```tsx
// Preferred: Clear, typed, documented
interface HeroSectionProps {
  title: string
  subtitle?: string
  backgroundImage: ImageData
  className?: string
}

export function HeroSection({
  title,
  subtitle,
  backgroundImage,
  className
}: HeroSectionProps) {
  // Implementation
}
```

### State Management

- **Server state** - TanStack Query for API data
- **Client state** - Zustand for UI state
- **Form state** - React Hook Form with Zod validation
- **URL state** - nuqs for shareable state

### Performance Budgets

- **LCP** < 2.5s (Largest Contentful Paint)
- **FID** < 100ms (First Input Delay)
- **CLS** < 0.1 (Cumulative Layout Shift)
- **Bundle size** - Monitor and optimize aggressively

## Decision Framework

When making technical decisions, prioritize in this order:

1. **User Experience** - Does it improve the user's journey?
2. **Accessibility** - Is it usable by everyone?
3. **Performance** - Does it maintain our speed standards?
4. **Maintainability** - Can we sustain this long-term?
5. **Developer Experience** - Is it pleasant to work with?

## Anti-Patterns to Avoid

- Over-engineering simple features
- Premature optimization
- Inconsistent naming conventions
- Skipping accessibility testing
- Ignoring mobile experience
- Adding dependencies without justification
