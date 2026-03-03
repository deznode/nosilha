# Newsletter Subscription Manual Test Report

- **Feature**: `006-newsletter-subscription`
- **Environment**: Local dev (`http://localhost:3000`), server already running
- **Date**: 2025-??-?? (fill with execution date)

## Test Summary

| Scenario (Checklist Ref)                                      | Location          | Result | Notes                                                                           |
| ------------------------------------------------------------- | ----------------- | ------ | ------------------------------------------------------------------------------- |
| Valid email submission (`@23`, `@113`)                        | Homepage & footer | ✅     | Clear success messaging, inputs reset, toast emitted in footer                  |
| Empty field validation (`@33`, `@125`)                        | Homepage & footer | ✅     | Inline `role="alert"` copy “Email is required”, `aria-invalid="true"`           |
| Invalid format validation & edge cases (`@40`, `@47`, `@132`) | Homepage & footer | ✅     | All listed invalid formats return “Please enter a valid email address”          |
| Duplicate email handling (`@57`, `@140`)                      | Homepage & footer | ❌     | Duplicate submissions behave like new success; no friendly info state           |
| Double-click prevention (`@76`)                               | Homepage          | ❌     | Button never disables nor shows “Subscribing…”, multiple requests fire          |
| Keyboard navigation (`@85`, `@177`)                           | Homepage & footer | ✅     | Inputs/buttons reachable via Tab order, SR alerts fire                          |
| Toast behavior (`@118-119`, `@144-145`, `@167`)               | Footer            | ❌     | Toasts stack and remain indefinitely; no 5s (success) / 8s (error) auto-dismiss |

## Detailed Findings

1. **Duplicate email UX missing** (`@57`, `@140`): Resubmitting the same address returns the generic success state in both forms. Expected informational copy “This email is already subscribed...” and non-error styling per checklist.
2. **Button loading guard absent** (`@76`): Homepage CTA never disables or changes label during submission, allowing rapid multi-clicks that trigger several server calls. Checklist requires “Subscribing...” label + disabled state to prevent duplicates.
3. **Footer toast timing & stacking issues** (`@118-119`, `@144-145`, `@167`): Success toasts persist past 6s and every submission adds another toast instance. They should auto-dismiss after 5s (success) or 8s (error) and avoid piling up.

## Blocked / Not Verified

- Resend contact creation checks (`@28`, `@120`) require dashboard access outside this environment.

## Next Steps

1. Surface duplicate detection responses from `subscribeToNewsletter` in both forms with the specified friendly copy and neutral styling.
2. Add loading state management: disable buttons, show “Subscribing...” (hero) / `...` (footer), and ignore subsequent clicks until the action resolves.
3. Adjust the toast system to enforce auto-dismiss timers and limit concurrent toasts to maintain the calm feedback tone described in `docs/DESIGN_SYSTEM.md`.
