
## Plan: Fix Mobile View for Admin Site Settings Tabs and Improve Overall Mobile UI

### Problem Identified
The TabsList in the Admin Site Settings page has 4 tabs (Contact, Social Media, Business, Banner) but on mobile screens, they overflow without horizontal scroll capability. Users cannot swipe/scroll to access the "Banner" tab.

### Root Cause
The current `TabsList` styling doesn't have:
1. Horizontal overflow scroll enabled
2. Proper flex-shrink prevention on tab items
3. Touch-friendly sizing for mobile

---

### Solution Overview

**Files to modify:**
- `src/pages/admin/AdminSiteSettings.tsx` - Fix tabs layout for mobile
- `src/components/ui/tabs.tsx` - Add mobile-friendly base styles

---

### Implementation Details

#### 1. Fix TabsList for Mobile Scrolling (AdminSiteSettings.tsx)

**Lines 185-214** - Update TabsList to enable horizontal scrolling:

Current:
```tsx
<TabsList className="w-full justify-start rounded-none border-b bg-gray-50 p-0 h-auto">
```

Updated:
```tsx
<TabsList className="w-full flex justify-start rounded-none border-b bg-gray-50 p-0 h-auto overflow-x-auto scrollbar-hide">
```

Also update each TabsTrigger to prevent shrinking:
```tsx
<TabsTrigger 
  value="contact" 
  className="flex-shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-500 data-[state=active]:bg-white px-4 sm:px-6 py-3 text-xs sm:text-sm"
>
```

---

#### 2. Improve Mobile Tab Styling

Update all 4 TabsTrigger elements with:
- `flex-shrink-0` - Prevent tabs from shrinking
- `px-4 sm:px-6` - Smaller padding on mobile
- `text-xs sm:text-sm` - Smaller text on mobile
- `whitespace-nowrap` - Prevent text wrapping

---

#### 3. Update Base Tabs Component (tabs.tsx)

**Line 14-16** - Update TabsList base styles to support overflow:

```tsx
className={cn(
  "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground overflow-x-auto",
  className,
)}
```

---

#### 4. Additional Mobile UI Improvements

**Header section (Lines 163-179):**
- Stack header vertically on mobile
- Make Save button full-width on small screens

**Form grid (Lines 217, 226, 235, 244):**
- Already responsive with `md:grid-cols-2`
- Will remain single column on mobile

---

### Technical Changes Summary

```text
File: src/pages/admin/AdminSiteSettings.tsx
+--------------------------------+
| Line 185: Add overflow-x-auto  |
|           scrollbar-hide       |
+--------------------------------+
| Lines 186-213: Add flex-shrink-0|
|           to all TabsTrigger   |
|           Reduce padding/text  |
+--------------------------------+

File: src/components/ui/tabs.tsx
+--------------------------------+
| Line 14-16: Add overflow-x-auto|
|           to TabsList base     |
+--------------------------------+
```

---

### Visual Preview

**Before (Mobile):**
```
[Contact] [Social Med...] [Bus...]  <- Banner tab hidden/cut off
```

**After (Mobile):**
```
[Contact] [Social Media] [Business] [Banner] ->  <- Scrollable
```

---

### Benefits

1. All tabs are accessible on mobile via horizontal scroll
2. Touch-friendly tap targets maintained
3. Visual indicator that content is scrollable
4. Consistent with mobile app patterns
5. Works across all screen sizes
6. Uses native scroll behavior for smooth experience
