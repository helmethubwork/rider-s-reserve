
## Fix Blank Color Swatches

### Root Cause
When a color like `"Matt Black Grey"` or `"Black White"` is not found in `COLOR_MAP`, `getColorHex` returns the raw string (e.g. `"Matt Black Grey"`) as the CSS `background` value. CSS cannot parse this as a color, so the circle renders completely transparent/blank.

### Two-part fix

**Part 1 — Smarter `getSwatchBackground` parsing**

Many helmet colors are stored as two words separated by a space (e.g. `"Black Red"`, `"Black White"`, `"Matt Black Grey"`). The function currently only splits on `/`. We need to also try splitting on space and check each word against the COLOR_MAP.

New logic order:
1. Try exact match in COLOR_MAP
2. Try splitting by `/` → dual-tone gradient
3. Try splitting by last word vs rest (e.g. `"Black Red"` → Black + Red)
4. If still unresolved, extract any recognizable color keywords from the string
5. Final fallback: `#6b7280` (grey) — never blank

**Part 2 — Expand COLOR_MAP** with common helmet color names:

```ts
"matt black grey": "linear-gradient(135deg, #1a1a1a 50%, #6b7280 50%)",
"black grey": "linear-gradient(135deg, #1a1a1a 50%, #6b7280 50%)",
"black white": "linear-gradient(135deg, #1a1a1a 50%, #f0f0f0 50%)",
"black red": "linear-gradient(135deg, #1a1a1a 50%, #dc2626 50%)",
"black blue": "linear-gradient(135deg, #1a1a1a 50%, #2563eb 50%)",
"black yellow": "linear-gradient(135deg, #1a1a1a 50%, #eab308 50%)",
"black orange": "linear-gradient(135deg, #1a1a1a 50%, #ea580c 50%)",
"black green": "linear-gradient(135deg, #1a1a1a 50%, #16a34a 50%)",
"grey black": "linear-gradient(135deg, #6b7280 50%, #1a1a1a 50%)",
"white black": "linear-gradient(135deg, #f0f0f0 50%, #1a1a1a 50%)",
"red black": "linear-gradient(135deg, #dc2626 50%, #1a1a1a 50%)",
"blue black": "linear-gradient(135deg, #2563eb 50%, #1a1a1a 50%)",
"green black": "linear-gradient(135deg, #16a34a 50%, #1a1a1a 50%)",
// ...and more common combinations
```

**New smart fallback parser** — tries to extract recognizable color keywords from any string:

```ts
const COLOR_KEYWORDS = ["black", "white", "red", "blue", "green", "yellow",
  "orange", "purple", "pink", "grey", "gray", "silver", "gold", "brown"];

function extractColors(name: string): string[] {
  const lower = name.toLowerCase();
  return COLOR_KEYWORDS.filter(k => lower.includes(k));
}
```

If two keywords found → split gradient. If one found → solid color. If none → `#6b7280` grey fallback.

### Files to change

**1. `src/lib/colorUtils.ts`**
- Expand `COLOR_MAP` with common dual-color helmet combinations stored as gradient strings
- Rewrite `getSwatchBackground` with the smart multi-step resolver:
  1. Check full name in COLOR_MAP (handles both solids and pre-defined gradients)
  2. Split by `/` → gradient  
  3. Extract color keywords → gradient or solid
  4. Fallback to `#6b7280`

**2. No changes needed** to `ProductCard.tsx`, `ProductDetailPage.tsx`, or `SalePage.tsx` — they already call `getSwatchBackground` correctly. Only the utility logic needs fixing.

### Result
- `"Black"` → solid dark circle
- `"Black/Red"` → diagonal split black+red
- `"Matt Black Grey"` → diagonal split black+grey
- `"Black White-06"` → diagonal split black+white (strips number suffix)
- Any unrecognized name → grey circle (never blank)
