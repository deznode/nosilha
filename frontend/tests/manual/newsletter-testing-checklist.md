# Newsletter Subscription System - Manual Testing Checklist

**Feature**: Newsletter Subscription System (006-newsletter-subscription)
**Date**: 2025-11-18
**Test Environment**: Local development (http://localhost:3000)

## Prerequisites

- [x] Resend API key configured in `.env.local` (NOTE: Segment ID only needed for Broadcasts API)
- [x] Frontend development server running (`pnpm run dev`)
- [x] Browser DevTools open for console monitoring

---

## User Story 1: Subscribe from Homepage (P1 - MVP)

**Goal**: Enable visitors to subscribe to newsletter from the homepage with a prominent Ocean Blue gradient section

**Location**: http://localhost:3000 (homepage)

### Happy Path

- [x] **Valid email submission**
  - Navigate to homepage
  - Enter valid email: `test@example.com`
  - Click "Subscribe" button
  - **Expected**: Success message "Thank you for subscribing!" displays
  - **Expected**: Form clears (email input becomes empty)
  - **Expected**: Email added to Resend contacts (verify at https://resend.com/contacts)

### Validation Testing

- [ ] **Empty field validation**
  - Navigate to homepage
  - Leave email field empty
  - Click "Subscribe" button
  - **Expected**: Error message "Email is required" displays below input field
  - **Expected**: Error has `role="alert"` for screen readers

- [ ] **Invalid format validation**
  - Navigate to homepage
  - Enter invalid email: `notanemail`
  - Click "Subscribe" button (or tab away from field)
  - **Expected**: Error message "Please enter a valid email address" displays
  - **Expected**: Error appears inline below input field

- [ ] **Invalid format edge cases**
  - Test each invalid format:
    - `user` (no domain)
    - `user@` (incomplete domain)
    - `@example.com` (no local part)
    - `user @example.com` (space in local part)
  - **Expected**: All show "Please enter a valid email address"

### Duplicate Handling

- [ ] **Duplicate email handling**
  - Subscribe a test email successfully
  - Attempt to subscribe the same email again
  - **Expected**: Informational message "This email is already subscribed to our newsletter."
  - **Expected**: Message styling is friendly (not red error color)
  - **Expected**: No error logged in console

### Error Handling

- [ ] **ESP failure simulation**
  - Temporarily set invalid Resend API key in `.env.local`
  - Restart dev server
  - Attempt to subscribe
  - **Expected**: Error message "Failed to subscribe. Please try again later." after retry
  - **Expected**: Retry logic triggers (check console for retry logs)
  - Restore valid API key and restart server

### Loading States

- [ ] **Double-click prevention**
  - Enter valid email
  - Click "Subscribe" button multiple times rapidly
  - **Expected**: Button disabled after first click
  - **Expected**: Button text changes to "Subscribing..."
  - **Expected**: Only one submission occurs (check Resend dashboard)

### Accessibility

- [ ] **Keyboard navigation**
  - Navigate to homepage using Tab key only
  - Tab to email input field
  - Enter email address
  - Tab to Subscribe button
  - Press Enter to submit
  - **Expected**: All fields accessible via keyboard
  - **Expected**: Tab order is logical (email → button)

- [ ] **Screen reader testing** (VoiceOver on macOS or NVDA on Windows)
  - Enable screen reader
  - Navigate to email input
  - **Expected**: "Email" label announced
  - Submit with validation error
  - **Expected**: "Alert: Email is required" announced
  - Submit successfully
  - **Expected**: "Status: Thank you for subscribing!" announced

---

## User Story 2: Subscribe from Footer (P1 - MVP)

**Goal**: Enable visitors to subscribe to newsletter from any page footer with compact layout and toast notifications

**Location**: Any page footer (test on multiple pages)

### Happy Path

- [x] **Valid email submission**
  - Navigate to any page (homepage, directory, about)
  - Scroll to footer
  - Enter valid email in footer form
  - Click "Subscribe" button
  - **Expected**: Toast notification "Success! Thank you for subscribing!" displays
  - **Expected**: Toast auto-dismisses after 5 seconds
  - **Expected**: Form clears
  - **Expected**: Email added to Resend contacts (verify at https://resend.com/contacts)

### Validation Testing

- [ ] **Empty field validation**
  - Scroll to footer
  - Leave email field empty
  - Click "Subscribe" button
  - **Expected**: Error message "Email is required" displays inline below input
  - **Expected**: No toast notification

- [ ] **Invalid format validation**
  - Enter invalid email: `invalid@`
  - Click "Subscribe" or tab away
  - **Expected**: Error message "Please enter a valid email address" inline
  - **Expected**: No toast notification

### Duplicate Handling

- [ ] **Duplicate email handling**
  - Subscribe an email from footer
  - Attempt to subscribe same email again
  - **Expected**: Informational toast "This email is already subscribed to our newsletter."
  - **Expected**: Toast uses default variant (not destructive/red)
  - **Expected**: Toast auto-dismisses after 5 seconds

### Error Handling

- [ ] **ESP failure simulation**
  - Temporarily set invalid Resend API key
  - Restart dev server
  - Attempt to subscribe from footer
  - **Expected**: Error toast "Failed to subscribe. Please try again later."
  - **Expected**: Toast displays for 8 seconds (longer for errors)
  - Restore valid API key

### Cross-Page Consistency

- [ ] **Test from multiple pages**
  - Homepage footer
  - Directory listing page footer
  - Individual entry page footer
  - About page footer
  - **Expected**: Footer form appears on all pages
  - **Expected**: Behavior is consistent across all pages

### Toast Timing

- [ ] **Toast auto-dismiss timing**
  - Success toast: Start timer when displayed
  - **Expected**: Auto-dismisses after exactly 5 seconds
  - Error toast: Start timer when displayed
  - **Expected**: Auto-dismisses after exactly 8 seconds

### Accessibility

- [ ] **Keyboard navigation**
  - Tab to footer email input
  - Enter email
  - Tab to Subscribe button
  - Press Enter to submit
  - **Expected**: All fields accessible
  - **Expected**: Toast notification announced by screen reader

- [ ] **Screen reader testing**
  - Submit with validation error
  - **Expected**: Inline error announced
  - Submit successfully
  - **Expected**: Toast notification announced

---

## User Story 3: Handle Duplicate Subscriptions (P2)

**Goal**: Gracefully handle duplicate subscription attempts with user-friendly informational message

### Duplicate Detection Flow

- [ ] **Subscribe from homepage**
  - Use email: `duplicate-test@example.com`
  - Submit from homepage form
  - **Expected**: Success message
  - **Expected**: Email in Resend contacts (verify at https://resend.com/contacts)

- [ ] **Attempt duplicate from homepage**
  - Enter same email: `duplicate-test@example.com`
  - Submit from homepage form
  - **Expected**: Message "This email is already subscribed to our newsletter."
  - **Expected**: Informational styling (not red error)
  - **Expected**: Form clears on "success"

- [ ] **Attempt duplicate from footer**
  - Enter same email in footer
  - Submit from footer form
  - **Expected**: Toast with informational message
  - **Expected**: Toast uses default variant (not destructive)

### Error Verification

- [ ] **No console errors for duplicates**
  - Open browser console
  - Attempt duplicate subscription
  - **Expected**: No error logs
  - **Expected**: May see informational log about duplicate detection

### Visual Consistency

- [ ] **Message styling verification**
  - Compare duplicate message to error message
  - **Expected**: Duplicate message is NOT red
  - **Expected**: Duplicate message feels friendly and reassuring

---

## User Story 4: Spam Prevention (P2)

**Goal**: Block automated bot submissions using invisible honeypot field without impacting legitimate users

### Honeypot Invisibility

- [ ] **Homepage honeypot visibility**
  - Navigate to homepage newsletter section
  - Inspect page visually
  - **Expected**: No visible "website" field
  - Use browser DevTools to inspect DOM
  - **Expected**: Hidden input with `name="website"` exists
  - **Expected**: CSS class includes `absolute left-[-9999px]`

- [ ] **Footer honeypot visibility**
  - Scroll to footer
  - Inspect form visually
  - **Expected**: No visible "website" field
  - Use DevTools to inspect
  - **Expected**: Hidden input exists with same attributes

### Honeypot Detection

- [ ] **Manual honeypot trigger (homepage)**
  - Open browser DevTools → Console
  - Run: `document.querySelector('input[name="website"]').value = 'bot@spam.com'`
  - Fill email field: `real-user@example.com`
  - Submit form
  - **Expected**: Fake success message "Thank you for subscribing!"
  - **Expected**: Email NOT added to Resend contacts (verify at https://resend.com/contacts)
  - **Expected**: Spam event logged in console

- [ ] **Automated script simulation**
  - Create a simple script to fill all form fields
  - Include honeypot field in script
  - Submit form programmatically
  - **Expected**: Silent rejection (fake success)
  - **Expected**: Spam logged with hashed email

### Legitimate User Testing

- [ ] **Normal submission with empty honeypot**
  - Do NOT fill honeypot field
  - Submit form normally
  - **Expected**: Submission succeeds
  - **Expected**: Email added to Resend contacts (verify at https://resend.com/contacts)

### Accessibility Verification

- [ ] **Screen reader honeypot handling**
  - Enable screen reader
  - Navigate through form with Tab key
  - **Expected**: Honeypot field completely skipped (not announced)
  - **Expected**: Tab order: email → subscribe button (no honeypot)

- [ ] **Keyboard navigation**
  - Tab through form
  - **Expected**: Honeypot never receives focus (`tabIndex={-1}`)

---

## User Story 5: Privacy and Unsubscribe Transparency (P3)

**Goal**: Build trust with privacy-conscious visitors by displaying clear privacy reassurance and unsubscribe capability

### Privacy Message Visibility

- [ ] **Homepage privacy message**
  - Navigate to homepage newsletter section
  - Locate privacy message near form
  - **Expected**: Text reads "We respect your privacy. Unsubscribe at any time."
  - **Expected**: Small text (text-sm), white with reduced opacity
  - **Expected**: Positioned below form or near submit button

- [ ] **Footer privacy message**
  - Scroll to footer newsletter form
  - Locate privacy message
  - **Expected**: Same text as homepage
  - **Expected**: Small text, muted foreground
  - **Expected**: Positioned below form

### Visual Design

- [ ] **Homepage styling**
  - Privacy message maintains Ocean Blue gradient background
  - Text is readable and accessible
  - Color contrast meets WCAG 2.1 AA standards

- [ ] **Footer styling**
  - Privacy message compatible with footer theme
  - Dark mode compatible (toggle dark mode and verify)

### Accessibility

- [ ] **Screen reader announcement**
  - Enable screen reader
  - Navigate to privacy message
  - **Expected**: Message is announced and readable

### Cross-Browser Testing

- [ ] **Chrome (latest)**
  - Test homepage and footer privacy message
  - **Expected**: Text displays correctly

- [ ] **Safari (latest)**
  - Test homepage and footer privacy message
  - **Expected**: Text displays correctly

- [ ] **Firefox (latest)**
  - Test homepage and footer privacy message
  - **Expected**: Text displays correctly

### Mobile Device Testing

- [ ] **iOS Safari**
  - Test on iPhone/iPad
  - **Expected**: Privacy message readable and accessible

- [ ] **Android Chrome**
  - Test on Android device
  - **Expected**: Privacy message readable and accessible

---

## Phase 8: Comprehensive Validation

### Performance Metrics

- [ ] **Form submission timing (normal conditions)**
  - Submit valid email
  - Measure time from click to success message
  - **Expected**: < 3 seconds

- [ ] **Validation feedback timing**
  - Trigger validation error
  - Measure time from input to error display
  - **Expected**: < 500ms (near-instant)

- [ ] **Retry timeout verification**
  - Simulate network timeout
  - Observe retry behavior
  - **Expected**: 5-second timeout, single retry

- [ ] **Loading state transitions**
  - Click submit and observe button
  - **Expected**: Text changes immediately to "Subscribing..." (homepage) or "..." (footer)
  - **Expected**: Button disabled state applied

### Network Throttling

- [ ] **3G simulation**
  - Open DevTools → Network → Throttling → Slow 3G
  - Submit form
  - **Expected**: Form still works within 10 seconds
  - **Expected**: Loading states remain active until response

### Functional Requirements Verification (FR-001 through FR-026)

- [ ] **FR-001**: Homepage form with "Stay Connected with Brava Island" heading
- [ ] **FR-002**: Footer form with "Subscribe to our newsletter" heading
- [ ] **FR-003**: Email validation (empty field)
- [ ] **FR-004**: Email validation (invalid format)
- [ ] **FR-005**: Error message "Email is required"
- [ ] **FR-006**: Error message "Please enter a valid email address"
- [ ] **FR-007**: Loading state "Subscribing..." (homepage)
- [ ] **FR-008**: Loading state "..." (footer)
- [ ] **FR-009**: Success messages and form clearing
- [ ] **FR-010**: Duplicate handling with informational message
- [ ] **FR-011**: Honeypot spam prevention
- [ ] **FR-012**: Privacy message on both forms
- [ ] **FR-013**: Retry logic (5-second timeout, single retry)
- [ ] **FR-014**: Logging with hashed emails
- [ ] **FR-015**: 30-day log retention
- [ ] **FR-016**: HTTPS transmission
- [ ] **FR-017**: WCAG 2.1 Level AA compliance

### Success Criteria Verification (SC-001 through SC-010)

- [ ] **SC-001**: Subscription completion < 10 seconds
- [ ] **SC-002**: Validation errors < 500ms
- [ ] **SC-003**: Form submission < 3 seconds (normal)
- [ ] **SC-004**: Form submission < 10 seconds (with retry)
- [ ] **SC-005**: 100 subscriptions/day capacity (load testing if possible)
- [ ] **SC-006**: 95% submission success rate (monitor Resend dashboard)
- [ ] **SC-007**: Screen reader announcements verified
- [ ] **SC-008**: Full keyboard navigation
- [ ] **SC-009**: Graceful ESP unavailability handling

---

## Test Summary

**Total Test Cases**: 60+

**Test Completion**:
- [ ] All User Story 1 scenarios complete
- [ ] All User Story 2 scenarios complete
- [ ] All User Story 3 scenarios complete
- [ ] All User Story 4 scenarios complete
- [ ] All User Story 5 scenarios complete
- [ ] All Phase 8 validation scenarios complete

**Tested By**: _________________
**Date**: _________________
**Environment**: _________________
**Browser(s)**: _________________
**Screen Reader**: _________________

**Notes/Issues Found**:
```
[Add any issues or observations here]
```

**Approval**:
- [ ] All tests passed
- [ ] Feature ready for production deployment

---

## Quick Reference: Common Test Emails

```
# Valid formats
test@example.com
user+tag@example.com
user@subdomain.example.com

# Invalid formats (should trigger validation)
notanemail
user
user@
@example.com
user @example.com

# Duplicate testing
duplicate-test@example.com
```

## Quick Reference: Resend Dashboard

**URL**: https://resend.com/contacts

**What to verify**:
- Email appears in contacts list
- Contact status is "Active" (unsubscribed: false)
- Timestamp matches submission time
- No duplicate entries for same email
