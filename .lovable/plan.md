

## Plan: Fix Mobile Header - Show Cart Icon & Improve UI

### Problem Identified
The mobile header's account button now displays avatar + name + chevron, which takes too much horizontal space and pushes the cart icon out of view or makes it cramped.

### Current Layout Order (Mobile)
```
[Menu] [Search] ... [LOGO] ... [Search] [Account+Name+Chevron] [Cart]
```

### Solution: Reorganize Mobile Header Icons

**File to modify:** `src/components/layout/Header.tsx`

### Implementation Details

1. **Reduce account button width for mobile**
   - Remove the name text from the mobile account button (keep just avatar + chevron)
   - This maintains the personalized avatar with initial while saving horizontal space

2. **Make cart icon more prominent**
   - Increase cart icon size slightly for better visibility
   - Add subtle background to make it stand out

3. **Improve icon spacing and sizing**
   - Ensure consistent padding and sizing across mobile icons
   - Use smaller chevron or remove it from mobile view

### Visual Preview
```
Before: [≡] [🔍] ... HELMETHUB ... [🔍] [J John ▼] [🛒]  (cart gets pushed/hidden)
After:  [≡] [🔍] ... HELMETHUB ... [🔍] [J ▼] [🛒]       (compact, visible cart)
```

### Technical Changes

**Lines 366-378** - Simplify mobile account button:
```tsx
<button
  onClick={() => setMobileAccountDropdownOpen(!mobileAccountDropdownOpen)}
  className="flex items-center gap-1 p-2 text-foreground hover:text-primary hover:bg-secondary rounded-lg transition-all active:scale-95"
  aria-label="My profile"
>
  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
    {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
  </div>
  <ChevronDown size={14} className={`transition-transform ${mobileAccountDropdownOpen ? 'rotate-180' : ''}`} />
</button>
```

**Lines 503-514** - Enhance cart button visibility:
```tsx
<Link 
  to="/cart" 
  className="p-2 text-foreground hover:text-primary hover:bg-secondary rounded-lg transition-all relative active:scale-95 flex items-center justify-center"
  aria-label="Cart"
>
  <ShoppingCart size={22} />
  {totalItems > 0 && (
    <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
      {totalItems > 9 ? '9+' : totalItems}
    </span>
  )}
</Link>
```

### Benefits
- Cart icon is always visible on mobile
- Account button remains personalized with user's initial
- Clean, uncluttered mobile header
- Better touch targets for mobile users
- Consistent spacing across all header icons

