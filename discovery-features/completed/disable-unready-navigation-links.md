# Disable Unready Navigation Links

**Status**: Completed
**Priority**: Medium
**Time Estimate**: 1-2 hours
**Dependencies**: None

## Objective

Temporarily comment out navigation links for features that are not ready yet:
- Photo galleries section
- Towns and villages section

This ensures users don't encounter unimplemented features while maintaining the codebase structure for future implementation.

## Implementation Steps

### Phase 1: Identify Unready Links (30 minutes)
1. **Main Navigation**: Check primary navigation components for gallery and towns/villages links
2. **Hero Section**: Look for call-to-action buttons or links to these sections
3. **Directory Pages**: Check for cross-references or related links
4. **Footer**: Verify if these sections are referenced in footer navigation

### Phase 2: Comment Out Links (45 minutes)
1. **Add HTML Comments**: Use `{/* TODO: Enable when feature is ready */}` pattern
2. **Preserve Structure**: Keep the navigation structure intact but disable functionality
3. **Add Proper Documentation**: Include comments explaining when links will be re-enabled
4. **Consider Visual Placeholder**: Optionally add "Coming Soon" styling or disable appearance

### Phase 3: Documentation and Testing (30 minutes)
1. **Update Plan**: Move this plan to completed when done
2. **Test Navigation**: Verify all navigation still works properly
3. **Visual Review**: Ensure the UI looks intentional, not broken
4. **Document Re-enablement**: Note what needs to be done to re-enable these links

## Files to Check

### Primary Navigation
- `frontend/src/components/ui/page-header.tsx` - Main navigation component
- `frontend/src/app/layout.tsx` - Root layout navigation
- `frontend/src/components/navigation/*` - Any navigation components

### Hero/Landing Sections
- `frontend/src/app/page.tsx` - Homepage with potential call-to-action links
- `frontend/src/components/hero/*` - Hero section components

### Directory and Content Pages
- `frontend/src/app/directory/page.tsx` - Directory main page
- `frontend/src/app/directory/[category]/page.tsx` - Category pages
- Any components with cross-references to galleries or villages

## Success Criteria

- ✅ All links to unimplemented features are commented out
- ✅ Navigation structure remains clean and intentional
- ✅ User experience is not broken by dead links
- ✅ Code is properly documented for future re-enablement
- ✅ Visual design maintains professionalism

## Re-enablement Plan

When ready to implement:
1. Remove the comment blocks around the links
2. Implement the actual feature pages/components
3. Test the navigation flow end-to-end
4. Update this plan to completed status

## Notes

- This is a temporary solution to improve user experience
- Maintains development momentum without breaking existing functionality
- Preserves code structure for future feature implementation