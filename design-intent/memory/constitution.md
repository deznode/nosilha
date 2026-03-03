# Development Constitution

> Core principles governing all development decisions for Nos Ilha Cultural Heritage Platform

## Article I: Simplicity First

### 1.1 Content Over Complexity
Cultural heritage content is sacred. Every technical decision must serve the mission of preserving and celebrating Brava Island's cultural memory. Avoid over-engineering that obscures the content.

### 1.2 Minimal Viable Implementation
- Implement the simplest solution that works
- Add complexity only when proven necessary
- Delete code before adding workarounds

### 1.3 Three-Line Rule
Three similar lines of code are better than a premature abstraction. Create utilities only when a pattern repeats more than three times across different contexts.

## Article II: Framework Guidance

### 2.1 Next.js 16 + React 19.2
- **Server Components First**: Default to React Server Components for data fetching and static content
- **Client Components**: Use `'use client'` only when interactivity (`useState`, `useEffect`) is required
- **App Router**: Use route groups `(auth)`, `(main)`, `(admin)` for logical organization
- **Dynamic Routes**: Follow existing patterns: `/directory/[category]/[slug]`, `/towns/[name]`

### 2.2 TypeScript Standards
- Strict mode enabled
- No `any` types without explicit justification
- Use Zod for runtime validation at system boundaries
- Type inference over explicit annotations when clear

### 2.3 State Management
- **Zustand**: Client-side UI state, preferences, filter state
- **TanStack Query**: Server state with caching, background refetch
- **URL State**: Search params for shareable/bookmarkable state

## Article III: Cultural Heritage Integrity

### 3.1 Content Authenticity
- All cultural content must be verified through proper channels (see `docs/CULTURAL_HERITAGE_VERIFICATION.md`)
- Prioritize community voices and local perspectives
- Respect the "morabeza" spirit in all content

### 3.2 Accessibility & Inclusion
- WCAG 2.1 AA compliance minimum
- Mobile-first design (diaspora accesses primarily on mobile)
- Support for Portuguese, English, and French

### 3.3 Performance for Global Access
- Target sub-3 second load times on 3G connections
- Optimize images for Cape Verdean internet infrastructure
- Use ISR caching strategically

## Article IV: Code Quality

### 4.1 No Dead Code
- Remove unused imports, variables, and functions
- No backwards-compatibility shims for internal code
- No `// TODO` comments without linked issues

### 4.2 Self-Documenting Code
- Clear naming over comments
- Comments explain "why", not "what"
- Type definitions serve as documentation

### 4.3 Error Handling
- Handle errors at system boundaries (API calls, user input)
- Trust internal code and framework guarantees
- Fail fast with meaningful messages

## Article V: Testing Philosophy

### 5.1 Testing Pyramid
- Unit tests: Critical business logic, utilities, hooks
- Integration tests: API routes, data flows
- E2E tests: Critical user journeys only

### 5.2 Test What Matters
- Don't test framework behavior
- Don't test implementation details
- Focus on user-observable behavior

## Article VI: UI Quality

### 6.1 Nos Ilha Design System
- **Primary**: Ocean Blue (`#0e4c75`) for actions and links
- **Success**: Valley Green (`#3E7D5A`) for nature imagery
- **Accent**: Bougainvillea Pink (`#D90368`) for highlights
- **Warning**: Sunny Yellow (`#F7B801`) for CTAs

### 6.2 Typography
- **Headings**: Fraunces (serif) - warm, cultural, authentic
- **Body**: Outfit (sans-serif) - clean, modern, readable

### 6.3 Animation (Framer Motion)
- Use motion tokens from `lib/animation` system
- Respect `prefers-reduced-motion`
- Animations should enhance, not distract from content
- Keep durations under 300ms for UI feedback

### 6.4 Responsive Design
- Mobile-first breakpoints: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`
- Touch-friendly tap targets (minimum 44x44px)
- Test on real devices, not just browser devtools

## Article VII: Workflow

### 7.1 Before Writing Code
1. Understand the user need
2. Check existing patterns in codebase
3. Consider cultural heritage implications
4. Plan the minimal implementation

### 7.2 During Development
1. Work incrementally with small commits
2. Keep the build passing
3. Test on mobile viewports
4. Validate against design system

### 7.3 Before Merging
1. Self-review the diff
2. Ensure accessibility compliance
3. Verify mobile experience
4. Check for dead code

---

*This constitution is a living document. Updates require discussion and consensus.*
