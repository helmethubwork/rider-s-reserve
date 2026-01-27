

## Plan: Fix Mobile View - Banner Tab Access and Comprehensive Mobile UI Improvements

### Problem Identified

The "Banner" tab in Admin Site Settings is not accessible on mobile because the parent container has `overflow-hidden` which clips the horizontal scroll of the TabsList.

**Root Cause (Line 183 in AdminSiteSettings.tsx):**
```tsx
<div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
```

The `overflow-hidden` prevents the scrollable tabs from extending beyond the container boundary.

---

### Solution Overview

**Files to modify:**
1. `src/pages/admin/AdminSiteSettings.tsx` - Fix tabs container overflow
2. `src/components/ui/tabs.tsx` - Add `flex-shrink-0` to base TabsTrigger
3. `src/index.css` - Add mobile scroll indicator utility
4. `src/pages/admin/AdminLayout.tsx` - Improve mobile content padding

---

### Implementation Details

#### 1. Fix Tabs Container Overflow (AdminSiteSettings.tsx)

**Line 183** - Remove `overflow-hidden` from parent, apply it only to TabsContent:

```tsx
// Before
<div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">

// After
<div className="bg-white rounded-xl border-2 border-gray-200">
```

The TabsContent sections already have their own padding and won't overflow visually.

---

#### 2. Update TabsList Wrapper for Better Mobile UX

**Lines 185-214** - Wrap TabsList in a container with proper overflow handling:

```tsx
{/* Scrollable tabs wrapper */}
<div className="overflow-x-auto scrollbar-hide border-b bg-gray-50">
  <TabsList className="inline-flex w-max min-w-full justify-start rounded-none p-0 h-auto bg-transparent">
    <TabsTrigger ...>Contact</TabsTrigger>
    <TabsTrigger ...>Social Media</TabsTrigger>
    <TabsTrigger ...>Business</TabsTrigger>
    <TabsTrigger ...>Banner</TabsTrigger>
  </TabsList>
</div>
```

Key changes:
- Outer wrapper handles `overflow-x-auto` without being clipped by parent
- TabsList uses `inline-flex w-max min-w-full` to expand to content width
- `bg-transparent` on TabsList since wrapper has background

---

#### 3. Improve Base TabsTrigger Component (tabs.tsx)

**Line 29-31** - Add `flex-shrink-0` to prevent tab squashing:

```tsx
className={cn(
  "inline-flex items-center justify-center whitespace-nowrap flex-shrink-0 rounded-sm px-3 py-1.5 text-sm font-medium ...",
  className,
)}
```

---

#### 4. Add Mobile Scroll Fade Indicator (index.css)

Add a visual cue that more content is scrollable:

```css
/* Scroll fade indicator for horizontal scroll areas */
.scroll-fade-right::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 40px;
  background: linear-gradient(to right, transparent, white);
  pointer-events: none;
}
```

---

#### 5. Improve Admin Layout Mobile Padding (AdminLayout.tsx)

**Line 273** - Increase mobile padding for better spacing:

```tsx
// Before
<main className="flex-1 p-4 md:p-5 lg:p-6 overflow-x-hidden">

// After
<main className="flex-1 p-3 sm:p-4 md:p-5 lg:p-6 overflow-x-hidden">
```

Also add safe-area padding for notched devices.

---

#### 6. Improve TabsTrigger Mobile Sizing (AdminSiteSettings.tsx)

Update all TabsTrigger elements with better mobile sizing:

```tsx
<TabsTrigger 
  value="contact" 
  className="flex-shrink-0 whitespace-nowrap rounded-none border-b-2 border-transparent 
             data-[state=active]:border-yellow-500 data-[state=active]:bg-white 
             px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 text-xs sm:text-sm 
             min-w-[70px] sm:min-w-[90px]"
>
  <Phone size={14} className="mr-1.5 sm:mr-2 flex-shrink-0" />
  <span>Contact</span>
</TabsTrigger>
```

Changes:
- Reduced icon size on mobile (16 to 14)
- Smaller padding on mobile
- Minimum width to ensure tappable area
- Wrapped text in `<span>` for better control

---

### Technical Summary

| File | Line(s) | Change |
|------|---------|--------|
| AdminSiteSettings.tsx | 183 | Remove `overflow-hidden` from container |
| AdminSiteSettings.tsx | 185-214 | Wrap TabsList in scrollable div, update triggers |
| tabs.tsx | 30 | Add `flex-shrink-0` to TabsTrigger base |
| index.css | 345+ | Add scroll-fade utility class |
| AdminLayout.tsx | 273 | Improve mobile padding |

---

### Visual Result

**Before (Mobile):**
```
[Contact] [Social Med...] [Bus...]  <- Banner hidden, can't scroll
```

**After (Mobile):**
```
[Contact] [Social] [Business] [Banner] ->  <- Smooth horizontal scroll
```

---

### Benefits

1. All 4 tabs accessible on all mobile devices
2. Smooth native horizontal scrolling
3. Touch-friendly tap targets maintained
4. Visual consistency with other scrollable areas in the app
5. Works on Android, iOS, and all screen sizes
6. No content clipping or overflow issues

