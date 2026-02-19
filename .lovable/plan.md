
## Add Color Swatches to Admin Panel

### What needs to change

The admin panel currently shows colors only as plain text (comma-separated in inputs). The user wants visual color swatches — like circular dots — displayed in the admin product list and forms, matching the reference image.

---

### Where swatches will appear

1. **Products Table** (`AdminProducts.tsx`) — Show color dots in each product row, below the product name
2. **Quick Edit Dialog** (`AdminProducts.tsx`) — Show live swatch preview below the Colors input as admin types
3. **Add Product Form** (`AdminAddProduct.tsx`) — Same live swatch preview below the Colors input

---

### Technical Plan

#### Step 1 — Create Color Utility (`src/lib/colorUtils.ts`)

A new shared file mapping color name strings to CSS hex values, used across both admin and public site:

```ts
export const COLOR_MAP: Record<string, string> = {
  black: "#1a1a1a",
  white: "#f0f0f0",
  red: "#dc2626",
  blue: "#2563eb",
  green: "#16a34a",
  yellow: "#eab308",
  orange: "#ea580c",
  purple: "#7c3aed",
  pink: "#db2777",
  grey: "#6b7280",
  gray: "#6b7280",
  silver: "#c0c0c0",
  gold: "#d97706",
  brown: "#92400e",
  "matte black": "#1a1a1a",
  "gloss white": "#f0f0f0",
  "matt black": "#1a1a1a",
};

export const getColorHex = (name: string): string =>
  COLOR_MAP[name.toLowerCase().trim()] ?? "#9ca3af";
```

---

#### Step 2 — Add Color Swatches to Products Table

**File:** `src/pages/admin/AdminProducts.tsx`

In the product row, below the product name, add a small swatch row if `product.colors` is present:

```tsx
{product.colors && product.colors.length > 0 && (
  <div className="flex items-center gap-1 mt-1">
    {product.colors.slice(0, 5).map((color) => (
      <span
        key={color}
        title={color}
        className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block shadow-sm"
        style={{ background: getColorHex(color) }}
      />
    ))}
    {product.colors.length > 5 && (
      <span className="text-[10px] text-gray-500">+{product.colors.length - 5}</span>
    )}
  </div>
)}
```

This renders dots right under the product name in the table row.

---

#### Step 3 — Live Swatch Preview in Quick Edit Dialog Colors Field

**File:** `src/pages/admin/AdminProducts.tsx` (around line 1082)

After the colors Input, add a live preview that parses the current `formData.colors` string into swatches:

```tsx
{/* Colors */}
<div className="space-y-2">
  <Label htmlFor="colors">Colors</Label>
  <Input
    id="colors"
    value={formData.colors}
    onChange={(e) => handleInputChange('colors', e.target.value)}
    placeholder="Black, Red, Blue (comma separated)"
  />
  <p className="text-xs text-muted-foreground">Enter colors separated by commas</p>
  {/* Live swatch preview */}
  {formData.colors.trim() && (
    <div className="flex flex-wrap gap-2 pt-1">
      {formData.colors.split(',').map(c => c.trim()).filter(Boolean).map((color) => (
        <div key={color} className="flex items-center gap-1.5">
          <span
            title={color}
            className="w-5 h-5 rounded-full border border-gray-300 shadow-sm inline-block"
            style={{ background: getColorHex(color) }}
          />
          <span className="text-xs text-gray-600">{color}</span>
        </div>
      ))}
    </div>
  )}
</div>
```

---

#### Step 4 — Live Swatch Preview in Add Product Form Colors Field

**File:** `src/pages/admin/AdminAddProduct.tsx` (around line 556)

Same swatch preview after the colors Input inside the `{'colors' in config.fields}` block:

```tsx
{'colors' in config.fields && (
  <div className="space-y-2">
    <Label htmlFor="colors">{config.fields.colors.label}</Label>
    <Input
      id="colors"
      value={colors}
      onChange={(e) => setColors(e.target.value)}
      placeholder={config.fields.colors.placeholder}
      disabled={isLoading}
    />
    <p className="text-xs text-muted-foreground">Separate colors with commas</p>
    {/* Live swatch preview */}
    {colors.trim() && (
      <div className="flex flex-wrap gap-2 pt-1">
        {colors.split(',').map(c => c.trim()).filter(Boolean).map((color) => (
          <div key={color} className="flex items-center gap-1.5">
            <span
              title={color}
              className="w-5 h-5 rounded-full border border-gray-300 shadow-sm inline-block"
              style={{ background: getColorHex(color) }}
            />
            <span className="text-xs text-gray-600">{color}</span>
          </div>
        ))}
      </div>
    )}
  </div>
)}
```

---

### Files to Create / Modify

| File | Change |
|---|---|
| `src/lib/colorUtils.ts` | New file — color name → hex mapping utility |
| `src/pages/admin/AdminProducts.tsx` | Add swatches in table rows + live preview in colors input |
| `src/pages/admin/AdminAddProduct.tsx` | Add live swatch preview in colors input |

---

### Visual Result

- In the **products table**: each row with colors shows tiny colored dots under the product name (e.g., 3-5 dots for Black, Red, Blue)
- In the **form inputs**: as the admin types `Black, Red, Blue`, colored dots appear instantly below as a live preview with color name labels
- The swatch style matches the reference image: round dots with a border, with the color name label beside each dot
