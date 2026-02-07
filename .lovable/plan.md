

## Plan: Add Dark/Light Theme Toggle to Header

### Overview
Add a theme toggle button in the header that allows users to switch between **dark** (current default) and **light** themes. The toggle will show a sun icon for light mode and a moon icon for dark mode.

---

### Current State

| Component | Status |
|-----------|--------|
| `next-themes` package | Already installed |
| `ThemeProvider` | NOT configured in App.tsx |
| CSS variables | Dark theme defined as default, `.dark` class exists |
| Light theme CSS | Does NOT exist (only `.admin-theme` for admin pages) |

---

### Implementation Steps

#### Step 1: Add Light Theme CSS Variables
**File:** `src/index.css`

Add a `.light` class with inverted colors (white background, dark text):

```css
.light {
  --background: 0 0% 98%;
  --foreground: 0 0% 9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 9%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 9%;
  --primary: 45 100% 51%;
  --primary-foreground: 0 0% 9%;
  --secondary: 0 0% 94%;
  --secondary-foreground: 0 0% 20%;
  --muted: 0 0% 94%;
  --muted-foreground: 0 0% 45%;
  --accent: 45 100% 51%;
  --accent-foreground: 0 0% 9%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 85%;
  --input: 0 0% 85%;
  --ring: 45 100% 51%;
}
```

---

#### Step 2: Configure ThemeProvider in App.tsx
**File:** `src/App.tsx`

Wrap the app with `ThemeProvider` from `next-themes`:

```tsx
import { ThemeProvider } from "next-themes";

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      {/* ... rest of app */}
    </QueryClientProvider>
  </ThemeProvider>
);
```

---

#### Step 3: Create Theme Toggle Component
**File:** `src/components/ThemeToggle.tsx` (new file)

A simple button with sun/moon icons that toggles between themes:

```tsx
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2.5 text-foreground hover:text-primary hover:bg-secondary rounded-lg transition-all"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;
```

---

#### Step 4: Add Theme Toggle to Header
**File:** `src/components/layout/Header.tsx`

Add the `ThemeToggle` component next to the search/cart icons in the header's right section:

```tsx
import ThemeToggle from "@/components/ThemeToggle";

// In the header's right icons section (around line 354):
<div className="flex items-center gap-1 sm:gap-2 md:gap-4">
  <ThemeToggle />  {/* Add here */}
  {/* ... existing search, account, cart buttons */}
</div>
```

---

### Visual Preview

**Dark Mode (Default):**
- Black background (#0A0A0A)
- White/light gray text
- Yellow accent color
- Shows **Sun icon** (click to switch to light)

**Light Mode:**
- White/light gray background (#FAFAFA)
- Dark text
- Yellow accent color
- Shows **Moon icon** (click to switch to dark)

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Add `.light` theme CSS variables |
| `src/App.tsx` | Wrap app with `ThemeProvider` |
| `src/components/ThemeToggle.tsx` | Create new component (new file) |
| `src/components/layout/Header.tsx` | Import and add ThemeToggle to header icons |

---

### Technical Notes

- Uses `next-themes` which is already installed
- Theme preference persists in localStorage
- `attribute="class"` applies theme via CSS class on `<html>` element
- `defaultTheme="dark"` keeps current dark theme as default
- `enableSystem={false}` disables automatic system preference detection (user explicitly chooses)
- The toggle shows on both desktop and mobile header

