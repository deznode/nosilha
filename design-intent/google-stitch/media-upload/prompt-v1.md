<!-- Layout: Media Upload Page -->

Design a mobile-first media upload interface for cultural heritage photo contributions with drag-drop functionality and real-time progress tracking.

- Center a prominent upload zone with dashed border inviting users to drag files or click to select from device
- Display upload icon (cloud with arrow) and instructional text "Drag photos here or tap to browse" within the drop zone
- Show accepted file types (JPEG, PNG, WebP, GIF, MP4) and size limit (50MB max) as subtle helper text below the zone
- Expand drop zone with highlighted border and slight scale animation when files are dragged over
- Stack multiple file upload cards vertically below drop zone when batch uploads are in progress

**Style**: Ocean blue primary (#005A8D) for active states and borders, soft neutral background (#F8F9FA), dashed 2px border with 12px border radius on drop zone, 48px padding inside zone, cloud icon at 64px size in muted gray (#6B7280), Lato 16px for instructions, 14px for helper text.

**Constraints**: Minimum 44×44 pixel touch targets for all interactive elements, maintain WCAG 2.1 AA contrast ratios, support keyboard navigation with visible focus indicators, ensure smooth transitions under 200ms.

---

<!-- Component: File Upload Card -->

Design individual file upload cards showing thumbnail preview, filename, upload progress, and status indicators.

- Display thumbnail preview (120×80 pixels) on left side with rounded 8px corners
- Show filename (truncated with ellipsis if over 30 characters), file size in human-readable format (e.g., "4.2 MB"), and content type badge
- Animate progress bar horizontally below file details filling left-to-right with ocean blue as upload proceeds
- Display percentage complete (e.g., "67%") right-aligned next to progress bar
- Show cancel button (X icon) on right edge allowing users to abort in-progress uploads
- Indicate success state with green checkmark icon and "Uploaded" label replacing progress bar
- Indicate failure state with red warning icon and "Upload failed - Retry" link replacing progress bar

**Style**: White card background with subtle shadow (0 1px 3px rgba(0,0,0,0.1)), 12px padding, 8px border radius, Lato 14px for filename, 12px gray (#6B7280) for file size, 4px height progress bar with 2px border radius, valley green (#3E7D5A) for success states, terracotta red (#C65D3B) for error states.

**Interaction**: Tap cancel button to abort upload with confirmation dialog, tap retry link to restart failed upload, smooth 100ms transitions for all state changes.

---

<!-- Component: Upload Success Confirmation -->

Design a success confirmation view displayed after all uploads complete showing summary and next actions.

- Display large success icon (checkmark in circle) centered at top with celebratory animation
- Show "Upload complete" heading with count of files uploaded (e.g., "3 photos uploaded successfully")
- List thumbnail previews of uploaded files in horizontal scrollable row
- Present two action buttons stacked vertically: "Upload more" (secondary outline style) and "View in library" (primary filled style)
- Include public URL display with copy button for each uploaded file

**Style**: Valley green (#3E7D5A) for success icon and confirmation elements, ocean blue (#005A8D) for primary action button, Merriweather 24px font-weight 600 for heading, Lato 16px for body text, 24px vertical spacing between sections, centered layout with 32px horizontal padding.

**Behavior**: Success view appears with fade-in animation after final upload completes, copy button shows toast "Link copied" for 2 seconds, "View in library" navigates to media gallery page.

---

<!-- Component: Error States -->

Design clear error messaging for upload failures including file validation errors and network issues.

- Display inline error message below drop zone when file type is unsupported with specific guidance
- Show size limit error with red text "File exceeds 50MB limit" when oversized file is selected
- Present network error banner at top of upload area with retry all option for connection failures
- Indicate rate limit reached with countdown timer showing when uploads will be allowed again

**Style**: Terracotta red (#C65D3B) for error text and icons, light red background (#FEF2F2) for error banners, Lato 14px for error messages, warning triangle icon at 20px, 12px padding in error banners, 4px border radius.

**Behavior**: Shake animation on drop zone when invalid file type is dropped, error messages auto-dismiss after 5 seconds or when user begins new upload, retry button resets all failed uploads.
