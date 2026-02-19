
## Show Color Swatches Like the Reference Image

### What the reference image shows
- Large circular color swatches (~40px diameter) displayed below the price on each product card
- Each circle has a visible border ring
- Swatches represent each available color variant
- On the Product Detail page, the current text pill buttons ("Black", "Red") should become the same large circular swatches with a ring highlight when selected

### Files to change

**1. `src/components/ProductCard.tsx`**
- Add optional `colors?: string[]` prop
- Import `getColorHex` from `@/lib/colorUtils`
- Render a row of large circular swatches (w-8 h-8 on desktop, w-6 h-6 on mobile) below the price, with a white border ring
- Show up to 5 swatches, then "+N" text if more

```tsx
{colors && colors.length > 0 && (
  <div className="flex items-center gap-2 pt-1">
    {colors.slice(0, 5).map((color) => (
      <span
        key={color}
        title={color}
        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-border shadow-md inline-block flex-shrink-0"
        style={{ background: getColorHex(color) }}
      />
    ))}
    {colors.length > 5 && (
      <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
        +{colors.length - 5}
      </span>
    )}
  </div>
)}
```

**2. `src/pages/CategoryPage.tsx`**
- Pass `colors={product.colors || []}` to `<ProductCard />`

**3. `src/pages/BrandDetailPage.tsx`**
- Pass `colors={product.colors || []}` to `<ProductCard />`

**4. `src/pages/ProductDetailPage.tsx`**
- Replace the current text pill color selector (lines 342–351) with large circular swatches matching the reference image
- Selected color gets a primary-colored ring (`ring-2 ring-primary ring-offset-2`)
- Show color name label next to the selector header

```tsx
{colors.length > 0 && (
  <div>
    <p className="text-sm font-medium tracking-wide uppercase mb-3 text-foreground">
      Color <span className="font-normal text-muted-foreground capitalize">— {selectedColor || colors[0]}</span>
    </p>
    <div className="flex flex-wrap gap-3">
      {colors.map(color => (
        <button
          key={color}
          onClick={() => setSelectedColor(color)}
          title={color}
          className={`w-10 h-10 rounded-full border-2 transition-all shadow-md ${
            (selectedColor || colors[0]) === color
              ? "border-primary ring-2 ring-primary ring-offset-2 scale-110"
              : "border-border hover:border-primary hover:scale-105"
          }`}
          style={{ background: getColorHex(color) }}
        />
      ))}
    </div>
  </div>
)}
```

**5. `src/pages/SalePage.tsx`** (uses local Product data, not Supabase)
- The SalePage renders its own inline product cards, not `<ProductCard />` — check if colors field exists in local data and add swatches in the card layout if applicable

### Visual result
- Product cards on Category, Brand, and Sale pages: large colored circles under the price
- Product Detail page: large circular swatches replace text buttons, with a ring highlight when selected
- Consistent with the reference image showing ~40px circular dots with visible borders
