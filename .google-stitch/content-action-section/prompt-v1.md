<!-- Layout: Content Action Toolbar -->

Design a fixed vertical sidebar for cultural heritage pages displaying engagement actions that remains centered in the viewport during scroll.

- Position toolbar vertically along the right edge with fixed positioning that stays centered vertically as users scroll through content
- Stack five action groups vertically: Share button at top, followed by four reaction emojis with counts, then three utility buttons (Copy Link, Suggest Improvement, Print)
- Size touch targets minimum 44×44 pixels with 12-16 pixels vertical spacing between actions for comfortable mobile interaction
- Display subtle background card with slight elevation shadow and rounded corners to distinguish toolbar from page content
- Collapse toolbar to floating action button on mobile screens below 768px width, expanding upward when tapped
- Show keyboard focus indicators with 3:1 contrast outline when users navigate with Tab key

**Style**: Ocean blue primary (#005A8D) for active states, soft neutrals for backgrounds (#F8F9FA light, #1F2937 dark mode), Lato font at 14px for labels, generous 16px padding around toolbar edges, subtle animations on interaction (100ms transitions).

**Constraints**: Maintain WCAG 2.1 AA contrast ratios, support dark mode color inversion, ensure toolbar doesn't obscure content on narrow viewports, keep total toolbar height under 600px to fit standard laptop screens.

---

<!-- Component: Share Button -->

Design a primary share button for diaspora content distribution that opens native sharing dialogs on mobile devices.

- Display prominent share icon (curved arrow or platform share symbol) with "Share" label below
- Show active state when tapped with brief scale animation and ocean blue background highlight
- Present toast confirmation message "Content shared successfully" for 2 seconds after successful share
- Indicate disabled state with reduced opacity when share functionality is unavailable

**Style**: Ocean blue fill (#005A8D) on active, white icon and text, 44×44 pixel minimum target size, 600 font weight for label, subtle drop shadow for depth, rounded 8px corners.

**Behavior**: Opens native mobile share dialog showing installed apps (WhatsApp, Email, Messages), displays fallback menu with "Copy Link" and "Share to Facebook" options on desktop browsers without native sharing.

---

<!-- Component: Reaction Emojis -->

Design an emoji reaction group showing four cultural appreciation responses with counts for authenticated users to express emotional connections to heritage content.

- Display four emoji buttons horizontally or vertically stacked: ❤️ Love, 👍 Helpful, 🤔 Interesting, 🙏 Thank You, each showing current count below
- Highlight user's selected reaction with ocean blue background circle and slightly larger size (120% scale)
- Animate reaction selection with brief bounce effect and increment count with smooth number transition
- Show "Log in to react" tooltip when unauthenticated users hover over reaction buttons
- Display reaction counts in muted gray when user hasn't reacted, ocean blue when user has selected that reaction

**Style**: 32×32 pixel emoji size, Lato 12px for counts, 8px padding around each reaction, subtle hover state with light gray background circle, smooth 200ms transitions for all state changes.

**Interaction**: Single tap toggles reaction on/off, tapping different reaction switches selection, visual feedback within 100ms of tap, disabled state shown with 50% opacity for unauthenticated users.

---

<!-- Component: Utility Actions -->

Design three secondary action buttons for practical content operations: copying links, suggesting improvements, and printing.

- Stack three icon-label buttons vertically: "Copy Link" with link icon, "Suggest Improvement" with edit icon, "Print" with printer icon
- Show brief toast confirmation "Link copied" centered at bottom of screen for 2 seconds after copy action
- Open suggestion form modal overlay when improvement button is tapped, keeping toolbar visible behind semi-transparent backdrop
- Trigger browser print dialog maintaining toolbar visibility in print preview

**Style**: Valley green accent (#3E7D5A) for improvement action emphasizing community contribution, neutral gray (#6B7280) for copy and print, 14px Lato labels, 20×20 pixel icons, 8px gap between icon and label, subtle hover background.

**Layout**: 44×44 pixel touch targets with 12px vertical spacing, left-aligned icon and label within button, consistent visual weight with lighter stroke icons compared to primary share button.

---

<!-- Component: Related Content Cards -->

Design a responsive grid of related heritage content items positioned below the main article encouraging continued exploration.

- Display 3-5 content cards in responsive grid: single column on mobile, two columns on tablet, three columns on desktop
- Show thumbnail image at top (16:9 aspect ratio), content type badge (overlaid on thumbnail), linked title in Merriweather, 50-80 character excerpt in Lato, and subtle right arrow indicating link
- Highlight entire card with slight elevation increase and ocean blue border on hover
- Load thumbnail images with blur placeholder to maintain layout stability during loading

**Style**: White background cards with 1px border (#E5E7EB), 16px padding, 8px border radius, soft drop shadow (0 1px 3px rgba(0,0,0,0.1)), content type badges with ocean blue background, Merriweather 18px font-weight 600 for titles, Lato 14px gray (#6B7280) for excerpts.

**Layout**: 16px gap between cards, maximum 400px card width, thumbnail height 225px maintaining 16:9 ratio, 8px space between thumbnail and title, 4px space between title and excerpt, section positioned 48px below main content and 48px above footer.
