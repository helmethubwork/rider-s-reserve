
## Plan: Fix Invisible Text in Form Inputs Across the Website

### Problem

When typing in form fields, the text is invisible because:
- The site uses a **dark theme** by default where `--foreground` is 98% white
- Some pages (Contact, Exchange/Returns, etc.) use `bg-white` on forms
- The Input/Textarea components use `text-foreground` which renders as **white text on white background** - completely invisible

---

### Solution Overview

Fix the Input and Textarea base components to always render dark text when placed on light backgrounds, and update page-level styling for consistency.

---

### Technical Details

#### 1. Update Input Component
**File:** `src/components/ui/input.tsx`

Add explicit `text-gray-900` class to ensure dark text regardless of theme:

```tsx
className={cn(
  "flex h-12 w-full rounded-md border border-input bg-background px-4 py-3 text-base text-gray-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  className,
)}
```

**Changes:**
- `text-foreground` → `text-gray-900` (always dark text)
- `placeholder:text-muted-foreground` → `placeholder:text-gray-500` (always visible placeholder)

---

#### 2. Update Textarea Component
**File:** `src/components/ui/textarea.tsx`

Same changes as Input:

```tsx
className={cn(
  "flex min-h-[100px] w-full rounded-md border border-input bg-background px-4 py-3 text-base text-gray-900 ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  className,
)}
```

---

#### 3. Update ContactPage Form Styling
**File:** `src/pages/ContactPage.tsx`

Update input classes for proper contrast and focus states:

| Before | After |
|--------|-------|
| `className="bg-white border-gray-300"` | `className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"` |

This ensures explicit text colors even if the base component is used elsewhere with theme colors.

---

#### 4. Update ExchangeReturnsPage Form Styling
**File:** `src/pages/ExchangeReturnsPage.tsx`

Same updates to all Input fields to ensure consistent visibility.

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/ui/input.tsx` | Change text-foreground to text-gray-900, update placeholder color |
| `src/components/ui/textarea.tsx` | Change text-foreground to text-gray-900, update placeholder color |
| `src/pages/ContactPage.tsx` | Add explicit text colors to inputs |
| `src/pages/ExchangeReturnsPage.tsx` | Add explicit text colors to inputs |

---

### Why This Works

1. **Explicit colors** (`text-gray-900`) override theme variables on light backgrounds
2. **Gray-500 placeholder** is visible on both white and dark backgrounds
3. **Backward compatible** - dark-themed pages using `bg-background` inputs will still work because they typically don't override with `bg-white`

---

### Visual Impact

| Element | Before | After |
|---------|--------|-------|
| Input text | Invisible (white on white) | Dark gray, clearly visible |
| Placeholder text | Very faint or invisible | Medium gray, visible |
| Focus state | Working | Working (no change) |

---

### Summary

This fix ensures that all form fields across the website have visible text when typing, by using explicit dark text colors instead of theme-dependent variables on light backgrounds.
