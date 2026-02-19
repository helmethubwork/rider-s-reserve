
## Sync Color Selection with Product Images

### What the user wants
When a color swatch is clicked (e.g., the 2nd color "BLACK NEON YELLOW"), the main image should automatically switch to the 2nd uploaded image. Images are uploaded in the same sequence as the colors list.

### How it works today
- Colors array: `["BLACK BLUE", "BLACK NEON YELLOW"]` (index 0, 1)
- Images fetched from storage: `[img-0.webp, img-1.webp]` (index 0, 1)
- Clicking a color only calls `setSelectedColor(color)` — it does NOT update `selectedImageIndex`

### The fix
Change the color button's `onClick` to also call `setSelectedImageIndex(colorIndex)` using the color's array index, clamped to the number of available images.

**One line change in `src/pages/ProductDetailPage.tsx` (line 348):**

Current:
```tsx
{colors.map(color => (
  <button
    onClick={() => setSelectedColor(color)}
    ...
  />
))}
```

Fixed:
```tsx
{colors.map((color, colorIndex) => (
  <button
    onClick={() => {
      setSelectedColor(color);
      // Switch to the image at the same position as this color
      const targetIndex = Math.min(colorIndex, thumbnails.length - 1);
      setSelectedImageIndex(targetIndex);
    }}
    ...
  />
))}
```

### Behavior after fix
- Colors: `["BLACK BLUE", "BLACK NEON YELLOW"]`
- Click color 1 (BLACK BLUE) → shows image index 0
- Click color 2 (BLACK NEON YELLOW) → shows image index 1
- If a color has no dedicated image (fewer images than colors), it safely shows the last available image

### File to change
- **`src/pages/ProductDetailPage.tsx`** — line 348, add `colorIndex` to the `.map()` and update `onClick` to also call `setSelectedImageIndex`
