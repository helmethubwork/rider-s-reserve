

## Plan: Increase Mobile Header Section Size

### Current State
The mobile header section (line 328) currently has:
- `py-3` padding on mobile (12px top/bottom)
- `sm:py-4` padding on small screens and up (16px top/bottom)

### Proposed Changes

**File to modify:** `src/components/layout/Header.tsx`

### Implementation Details

Increase the vertical padding and overall size of the header section to make it more prominent and easier to interact with on mobile devices.

**Line 328** - Update padding values:
```tsx
// Before
<div className="py-3 sm:py-4 border-b border-border/50">

// After
<div className="py-4 sm:py-5 border-b border-border/50">
```

This increases:
- Mobile padding: `py-3` (12px) → `py-4` (16px)
- Desktop padding: `sm:py-4` (16px) → `sm:py-5` (20px)

### Visual Preview
```
Before: Compact header with 12px vertical padding on mobile
After:  Taller header with 16px vertical padding on mobile
```

### Benefits
- More breathing room for header elements
- Easier touch targets for mobile users
- Better visual hierarchy
- More prominent branding area

