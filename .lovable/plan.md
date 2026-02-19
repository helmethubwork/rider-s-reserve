
## Dual-Tone Split Color Swatches

### What the user wants
Each color swatch circle should show two colors split diagonally (top-left half one color, bottom-right half another), matching the reference image where helmets like "Black/Red" or "Blue/Black" show as a split circle.

### How split colors work
Colors in the database can be stored as:
- Single: `"Black"` → solid circle
- Dual-tone: `"Black/Red"` or `"Black Red"` → split circle, half black / half red

The split effect is achieved with CSS `linear-gradient`:
```css
background: linear-gradient(135deg, #1a1a1a 50%, #dc2626 50%)
```

### New utility function in `src/lib/colorUtils.ts`
Add a `getSwatchBackground` function that:
1. Splits the color name by `/` or detects multi-word patterns
2. If two colors found → returns `linear-gradient(135deg, color1 50%, color2 50%)`
3. If one color → returns just the hex value (solid circle)

```ts
export const getSwatchBackground = (name: string): string => {
  const parts = name.split('/').map(p => p.trim()).filter(Boolean);
  if (parts.length === 2) {
    const c1 = getColorHex(parts[0]);
    const c2 = getColorHex(parts[1]);
    return `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`;
  }
  return getColorHex(name);
};
```

### Files to modify

**1. `src/lib/colorUtils.ts`**
- Add `getSwatchBackground(name)` function alongside existing `getColorHex`

**2. `src/components/ProductCard.tsx`**
- Import `getSwatchBackground` instead of `getColorHex`
- Change `style={{ background: getColorHex(color) }}` → `style={{ background: getSwatchBackground(color) }}`

**3. `src/pages/ProductDetailPage.tsx`** (Color Selector section ~line 342)
- Same swap: use `getSwatchBackground(color)` for the selector buttons

**4. `src/pages/SalePage.tsx`**
- Same swap in the inline card color swatch rendering

### Visual result
- A color stored as `"Black"` → solid black circle
- A color stored as `"Black/Red"` → circle with black on top-left, red on bottom-right (diagonal split)
- A color stored as `"Blue/Yellow"` → circle split blue and yellow
- Matches exactly the reference image style

### No data changes needed
The color naming format `"Black/Red"` is a natural way to name dual-tone colors. Admins just need to enter colors as `"Black/Red"` in the admin panel — no database schema changes required.
