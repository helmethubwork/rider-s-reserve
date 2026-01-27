

## Plan: Improve Mobile Account Icon to Show User Name

### Current State
- **Desktop view**: Already shows user icon with name and dropdown chevron
- **Mobile view**: Shows only a plain `UserCircle` icon without the user's name

### Proposed Changes

I'll enhance the mobile account button to display the user's first name (or initial) alongside the icon, making it more personalized and informative.

**File to modify:** `src/components/layout/Header.tsx`

### Implementation Details

1. **Update the mobile account button (lines 366-372)** to include the user's first name:
   - Replace the simple icon button with a styled button showing:
     - An avatar with user's initials (first letter of name)
     - The user's first name (truncated for space)
   - Keep the dropdown functionality intact

2. **Design approach:**
   - Show a small circular avatar with the user's initial(s)
   - Display the first name next to it (truncated to ~8 characters for mobile space)
   - Maintain compact styling suitable for mobile header

3. **Visual preview:**
   ```
   Before: [👤]
   After:  [JD] John ▼
   ```

### Technical Changes

```tsx
// Replace the mobile account button (currently just UserCircle icon)
// With an avatar + first name display

<button
  onClick={() => setMobileAccountDropdownOpen(!mobileAccountDropdownOpen)}
  className="flex items-center gap-1.5 p-2 text-foreground hover:text-primary hover:bg-secondary rounded-lg transition-all active:scale-95"
  aria-label="My profile"
>
  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
    {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
  </div>
  <span className="text-xs font-medium max-w-[60px] truncate">
    {profile?.full_name?.split(' ')[0] || 'Account'}
  </span>
  <ChevronDown size={12} className={`transition-transform ${mobileAccountDropdownOpen ? 'rotate-180' : ''}`} />
</button>
```

### Benefits
- Users can immediately see they're logged in
- Personalized experience showing their name
- Consistent with the desktop account button design
- Visual feedback with dropdown chevron indicator

