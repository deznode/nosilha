<!-- Component: Homepage Newsletter Section -->

Design a prominent newsletter subscription section for the Nos Ilha cultural heritage homepage.

- Full-width section with Ocean Blue gradient background (#005A8D to darker blue)
- Centered content layout (max-width 2xl) with heading "Stay Connected with Brava Island"
- Email input field (white background, gray text) paired with Subscribe button
- Display inline validation errors below input ("Email is required", "Please enter a valid email address")
- Success message appears after submission: "Thank you for subscribing to Nos Ilha updates!"
- Privacy reassurance text below form: "We respect your privacy. Unsubscribe at any time."

**Style:**
- Typography: Merriweather headings (3xl bold white), Lato body (lg white with 90% opacity)
- Mobile-first responsive design with stack-to-row button layout on larger screens
- Clean, inviting aesthetic reflecting Cape Verdean cultural heritage
- WCAG 2.1 Level AA accessible with proper focus states and ARIA labels

**Behavior:**
- Button changes to "Subscribing..." and disables during submission
- Form clears after successful subscription
- Support keyboard navigation with logical tab order

---

<!-- Component: Footer Newsletter Form -->

Design a compact newsletter subscription form for the Nos Ilha site footer.

- Minimal layout with heading "Subscribe to our newsletter" and description "The latest news, articles, and resources, sent to your inbox weekly"
- Horizontal form with email input and Subscribe button side-by-side
- Inline validation errors appear below input field with same messages as homepage
- Success/error toast notifications instead of inline messages (footer space constraints)
- Ocean Blue (#005A8D) accent color for button

**Style:**
- Typography: Small scale (sm text, compact spacing) for footer context
- Follows site footer design system (muted foreground text, border colors)
- Consistent with homepage form validation styling
- Dark mode compatible with theme-aware colors

**Behavior:**
- Button text changes to "..." during submission (compact version)
- Keyboard accessible with proper ARIA attributes
- Matches homepage form validation and submission patterns
