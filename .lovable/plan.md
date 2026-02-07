
Goal: Make typed text and UI colors visible across the whole website (public dark theme + admin light theme), without breaking either theme.

What’s happening
- We recently hardcoded form components (Input/Textarea/Label) to use dark text (`text-gray-900`).
- That fixed pages with white backgrounds, but it breaks dark pages like Checkout / Track Order where inputs sit on dark backgrounds (`bg-background` / `bg-card`). Result: typed text becomes dark on dark and looks “not visible”.
- Some pages (Shipping Policy, Warranty Policy, Contact, Exchange & Returns) are using `bg-white` but still rely on theme-based classes like `text-foreground` for buttons, which can also become low-contrast because the site’s default theme variables are dark.

Fix approach (site-wide, consistent)
1) Make core form components theme-aware again (global fix)
- Update these components so they use theme tokens:
  - Input: use `text-foreground` and `placeholder:text-muted-foreground` (instead of `text-gray-900`).
  - Textarea: same.
  - Label: use `text-foreground` (instead of `text-gray-900`).
Why: these components must automatically adapt to both dark public site and light admin theme.

2) Make “white-background” public pages actually use a light theme (so all UI tokens match)
- For pages that are intentionally light/white (policy pages and forms), wrap the page root with the existing `.admin-theme` class (already defined in `src/index.css`).
- Also switch their root background class from `bg-white` to `bg-background` so the background comes from the light theme variables.
Pages to update:
- `src/pages/ContactPage.tsx`
- `src/pages/ExchangeReturnsPage.tsx`
- `src/pages/ShippingPolicyPage.tsx`
- `src/pages/WarrantyPolicyPage.tsx`

This will automatically fix:
- Back button text (`text-foreground`) visibility
- Default button/inputs/selects visibility
- Any other components inside these pages that rely on theme variables

3) Clean up page-level overrides (only where needed)
- After steps (1) and (2), many of the manual classes like `text-gray-900 placeholder:text-gray-500` on Inputs in Contact/Exchange pages become optional.
- We will:
  - Keep them only if they’re needed for a specific design choice
  - Otherwise remove them to avoid future regressions and keep the UI consistent

4) Quick verification checklist (end-to-end)
- Public (dark) pages:
  - Checkout: type in Name/Email/Phone/Address and verify text is bright and readable.
  - Track Order: type in both fields and verify text is readable.
- Light public pages:
  - Contact page: verify Back button is visible; type in all fields.
  - Exchange & Returns: verify Select text is visible and typed text is readable.
  - Shipping/Warranty: verify Back button visible and content readable.
- Admin pages:
  - Admin forms: verify inputs remain readable (they will, because `admin-theme` already sets dark foreground text).

Files that will be changed
- Core UI components:
  - `src/components/ui/input.tsx`
  - `src/components/ui/textarea.tsx`
  - `src/components/ui/label.tsx`
- Light public pages:
  - `src/pages/ContactPage.tsx`
  - `src/pages/ExchangeReturnsPage.tsx`
  - `src/pages/ShippingPolicyPage.tsx`
  - `src/pages/WarrantyPolicyPage.tsx`

Technical notes (for maintainability)
- We will rely on CSS variables (`--foreground`, `--muted-foreground`, `--background`, etc.) as the single source of truth.
- `.admin-theme` will be reused as the “light theme wrapper” for public pages that are designed to be light. This avoids inventing a new theme system and ensures consistent colors across the site.
