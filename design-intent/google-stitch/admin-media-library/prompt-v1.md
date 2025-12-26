<!-- Layout: Admin Media Library -->

Design an admin dashboard for managing uploaded media with filtering, moderation queue, and bulk actions.

- Display horizontal tabs at top: "All Media", "Pending Review", "Approved", "Rejected" with count badges
- Present media items in responsive grid: 2 columns on mobile, 3 on tablet, 4 on desktop
- Show search bar with filter dropdowns (file type, upload date, uploader) above the grid
- Include bulk action toolbar that appears when items are selected with "Approve All", "Reject All", and "Delete" options
- Display pagination controls at bottom with page numbers and items-per-page selector

**Style**: Ocean blue (#005A8D) for active tab and selected states, soft neutral background (#F8F9FA), white content cards, Lato 14px for interface text, 16px gap between grid items, 24px padding around content area, subtle shadow on elevated elements.

**Constraints**: Maintain 44×44 pixel minimum touch targets, support keyboard navigation through grid, show loading skeleton while fetching data, preserve scroll position when returning from detail view.

---

<!-- Component: Media Thumbnail Card -->

Design media thumbnail cards displaying preview image, metadata, status badge, and quick actions.

- Display square thumbnail (200×200 pixels) with object-fit cover to fill frame
- Overlay status badge in top-right corner: amber "Pending" for pending_review, green "Approved" for available, red "Rejected" for deleted
- Show filename (truncated), upload date, and uploader name below thumbnail
- Display file size and dimensions in muted secondary text
- Present action icons on hover/focus: eye icon (preview), checkmark (approve), X (reject), trash (delete)
- Include checkbox in top-left corner for bulk selection

**Style**: White card with 1px border (#E5E7EB), 8px border radius, 12px padding below thumbnail, Lato 14px bold for filename, 12px gray (#6B7280) for metadata, status badges with 4px padding and 4px border radius, action icons at 20px in muted gray brightening to ocean blue on hover.

**Interaction**: Tap thumbnail to open full-size preview modal, tap action icons for immediate actions with confirmation for destructive operations, checkbox toggles selection for bulk actions.

---

<!-- Component: Media Detail Modal -->

Design a full-screen modal for viewing media details with moderation controls and metadata editing.

- Display full-resolution image or video player centered in modal with dark backdrop
- Show metadata panel on right side (desktop) or bottom sheet (mobile): filename, original size, dimensions, upload date, uploader, source, public URL
- Present moderation actions prominently: "Approve" (valley green), "Reject" (terracotta red), "Request Changes" (amber)
- Include text field for rejection reason when rejecting media
- Display "Associate with Directory Entry" dropdown for linking media to heritage sites
- Show copy button next to public URL for easy sharing

**Style**: Dark backdrop (#1F2937) with 80% opacity, white metadata panel with 24px padding, Merriweather 18px for headings, Lato 14px for metadata labels and values, valley green (#3E7D5A) approve button, terracotta red (#C65D3B) reject button, golden amber (#D4A574) for request changes, close X button in top-right corner.

**Behavior**: Escape key or backdrop click closes modal, approve/reject actions close modal and show success toast, left/right arrows navigate to previous/next media item, support pinch-to-zoom on mobile for images.

---

<!-- Component: Moderation Queue Empty State -->

Design an encouraging empty state for when all pending media has been reviewed.

- Display celebratory illustration (checkmark with sparkles or happy inbox character) centered
- Show heading "All caught up!" with supportive message "No media pending review"
- Present "View all media" link to navigate to complete library
- Include last reviewed timestamp and count of items reviewed today

**Style**: Muted illustration at 200px width, Merriweather 24px font-weight 600 for heading in valley green (#3E7D5A), Lato 16px gray (#6B7280) for body text, ocean blue (#005A8D) for link, centered layout with generous vertical spacing (48px above and below).

---

<!-- Component: Bulk Action Toolbar -->

Design a sticky toolbar appearing when media items are selected for batch operations.

- Position toolbar fixed at bottom of viewport with slight elevation above content
- Display selection count on left: "5 items selected" with checkbox to select/deselect all visible
- Present action buttons on right: "Approve All" (valley green), "Reject All" (terracotta red), "Delete" (gray with confirmation)
- Include close button to clear selection and dismiss toolbar

**Style**: White background with top shadow (0 -2px 8px rgba(0,0,0,0.1)), 16px vertical padding, 24px horizontal padding, Lato 14px bold for selection count, 36px height buttons with 16px horizontal padding, 8px gap between buttons.

**Behavior**: Toolbar slides up with 200ms animation when first item selected, slides down when all deselected, approve/reject actions show confirmation count before proceeding, delete requires explicit confirmation modal.
