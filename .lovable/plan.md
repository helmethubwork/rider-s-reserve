

## Plan: Further Increase Mobile Header Section Size

### Current State
The header section (line 328) currently has:
- `py-4` padding on mobile (16px top/bottom)
- `sm:py-5` padding on small screens and up (20px top/bottom)

### Proposed Changes

**File to modify:** `src/components/layout/Header.tsx`

### Implementation Details

Increase the vertical padding further to make the mobile header more prominent and spacious.

**Line 328** - Update padding values:
```tsx
// Before
<div className="py-4 sm:py-5 border-b border-border/50">

// After
<div className="py-5 sm:py-6 border-b border-border/50">
```

This increases:
- Mobile padding: `py-4` (16px) → `py-5` (20px)
- Desktop padding: `sm:py-5` (20px) → `sm:py-6` (24px)

### Visual Impact
```
Before: 16px vertical padding on mobile
After:  20px vertical padding on mobile (+4px each side)
```

### Benefits
- More breathing room for header elements
- Better touch targets for mobile users
- More prominent branding area
- Improved visual hierarchy on mobile devices

